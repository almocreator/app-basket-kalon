"use strict";
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Plus, Minus, ArrowLeft, Save } from "lucide-react";
import { updateMatchDetails } from "@/lib/actions";
import { useRouter } from "next/navigation";

// --- Types ---
interface Player {
    id: string;
    number: string;
    name: string;
    points: number;
    fouls: number;
    isOnCourt: boolean;
}

interface TeamState {
    name: string;
    score: number;
    fouls: number;
    timeouts: number; // 0-3 (dots)
    players: Player[];
}

interface GameState {
    period: number; // 1-4, etc
    timerSeconds: number; // e.g., 600 for 10 min
    isTimerRunning: boolean;
    home: TeamState;
    away: TeamState;
}

interface ScoreboardClientProps {
    matchId: string;
    initialData: any; // The full match object
    isReadOnly?: boolean;
}

// --- Helpers ---
const INITIAL_TIME = 600; // 10 minutes

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export function ScoreboardClient({ matchId, initialData, isReadOnly = false }: ScoreboardClientProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Initialize State from DB or Default
    const initializeState = (data: any) => {
        const details = data.details as any;
        if (details && details.gameState) {
            return details.gameState;
        }

        // Mock players if none exist
        const createMockPlayers = (prefix: string) =>
            Array.from({ length: 12 }).map((_, i) => ({
                id: `${prefix}-${i}`,
                number: `${i + 4}`,
                name: `JUGADOR ${i + 4}`,
                points: 0,
                fouls: 0,
                isOnCourt: i < 5
            }));

        return {
            period: 1,
            timerSeconds: INITIAL_TIME,
            isTimerRunning: false,
            home: {
                name: data.homeName || "LOCAL",
                score: data.homeScore || 0,
                fouls: 0,
                timeouts: 0,
                players: createMockPlayers("home")
            },
            away: {
                name: data.awayName || data.opponent || "VISITANTE",
                score: data.awayScore || 0,
                fouls: 0,
                timeouts: 0,
                players: createMockPlayers("away")
            }
        };
    };

    const [gameState, setGameState] = useState<GameState>(() => initializeState(initialData));

    // Sync state when initialData updates (via polling)
    useEffect(() => {
        setGameState(initializeState(initialData));
    }, [initialData]);

    // --- Polling for ReadOnly Users ---
    useEffect(() => {
        if (isReadOnly) {
            const interval = setInterval(() => {
                router.refresh();
            }, 5000); // 5 seconds polling
            return () => clearInterval(interval);
        }
    }, [isReadOnly, router]);

    // --- Timer Logic ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState.isTimerRunning && gameState.timerSeconds > 0) {
            interval = setInterval(() => {
                setGameState(prev => ({ ...prev, timerSeconds: prev.timerSeconds - 1 }));
            }, 1000);
        } else if (gameState.timerSeconds === 0) {
            setGameState(prev => ({ ...prev, isTimerRunning: false }));
        }
        return () => clearInterval(interval);
    }, [gameState.isTimerRunning, gameState.timerSeconds]);

    // --- Actions ---
    const toggleTimer = () => setGameState(prev => ({ ...prev, isTimerRunning: !prev.isTimerRunning }));
    const resetTimer = () => setGameState(prev => ({ ...prev, timerSeconds: INITIAL_TIME, isTimerRunning: false }));

    const updateScore = (team: "home" | "away", delta: number) => {
        setGameState(prev => ({
            ...prev,
            [team]: { ...prev[team], score: Math.max(0, prev[team].score + delta) }
        }));
    };

    const updateFouls = (team: "home" | "away", delta: number) => {
        setGameState(prev => ({
            ...prev,
            [team]: { ...prev[team], fouls: Math.max(0, Math.min(5, prev[team].fouls + delta)) }
        }));
    };

    const updatePeriod = (delta: number) => {
        setGameState(prev => ({ ...prev, period: Math.max(1, Math.min(4, prev.period + delta)) }));
    };

    const saveGame = async () => {
        setIsSaving(true);
        try {
            await updateMatchDetails(
                matchId,
                { gameState }, // Save full state in details
                gameState.home.score,
                gameState.away.score,
                "LIVE" // Keep it LIVE until manually finished? Or maybe just LIVE
            );
            // Optional: Toast success
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Auto-save every 30 seconds or on major events? 
    // For now, manual save + save on exit/unmount logic might be needed, but sticking to manual button for simplicity first.

    // --- Render Helpers ---
    const renderTeamPanel = (teamKey: "home" | "away", colorClass: string) => {
        const team = gameState[teamKey];
        return (
            <Card className={`flex-1 bg-black border-${colorClass}-900 border-opacity-50 text-${colorClass}-500 p-4 flex flex-col gap-4 min-w-[300px]`}>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <h2 className={`text-2xl font-bold text-${colorClass}-500 uppercase`}>{team.name}</h2>
                    <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={`h-3 w-3 rounded-full ${i < team.timeouts ? `bg-${colorClass}-500` : "bg-gray-800"}`} />
                        ))}
                    </div>
                </div>

                {/* Score Big Display */}
                <div className="flex justify-center py-6">
                    <span className="text-[8rem] font-mono leading-none tracking-tighter text-white font-bold" style={{ textShadow: `0 0 20px ${teamKey === 'home' ? 'red' : 'blue'}` }}>
                        {team.score.toString().padStart(3, "0")}
                    </span>
                </div>

                {/* Points Buttons */}
                {!isReadOnly && (
                    <div className="grid grid-cols-3 gap-2">
                        <Button onClick={() => updateScore(teamKey, 1)} className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white font-bold text-xl h-16`}>+1</Button>
                        <Button onClick={() => updateScore(teamKey, 2)} className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white font-bold text-xl h-16`}>+2</Button>
                        <Button onClick={() => updateScore(teamKey, 3)} className={`bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white font-bold text-xl h-16`}>+3</Button>
                        <Button onClick={() => updateScore(teamKey, -1)} variant="outline" className="border-gray-700 text-gray-400">-1</Button>
                        <Button onClick={() => updateScore(teamKey, -2)} variant="outline" className="border-gray-700 text-gray-400">-2</Button>
                        <Button onClick={() => updateScore(teamKey, -3)} variant="outline" className="border-gray-700 text-gray-400">-3</Button>
                    </div>
                )}


                {/* Foul Control */}
                <div className="bg-gray-900 rounded-lg p-3 mt-4 flex items-center justify-between">
                    <span className="text-gray-400 uppercase text-xs font-bold tracking-widest">Faltas de Equipo</span>
                    <div className="flex items-center gap-3">
                        {!isReadOnly && <Button size="icon" variant="outline" className="h-8 w-8 border-gray-700" onClick={() => updateFouls(teamKey, -1)}><Minus className="h-4 w-4" /></Button>}
                        <span className={`text-3xl font-bold ${team.fouls >= 5 ? "text-red-500 animate-pulse" : "text-white"}`}>{team.fouls}</span>
                        {!isReadOnly && <Button size="icon" variant="outline" className="h-8 w-8 border-gray-700" onClick={() => updateFouls(teamKey, 1)}><Plus className="h-4 w-4" /></Button>}
                    </div>
                </div>

                {/* Player List (Simplified for MVP) */}
                <div className="flex-grow overflow-auto mt-2 bg-gray-950 rounded border border-gray-800 p-2">
                    <div className="text-xs text-gray-500 mb-2 uppercase">Jugadores en pista</div>
                    {team.players.filter(p => p.isOnCourt).map(p => (
                        <div key={p.id} className="flex justify-between items-center py-1 border-b border-gray-800 text-sm hover:bg-gray-900 px-1">
                            <div className="flex gap-2 text-gray-300">
                                <span className="font-mono w-6 text-white font-bold">{p.number}</span>
                                <span className="truncate w-24">{p.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="border-yellow-900 text-yellow-600 text-[10px]">{p.points} pts</Badge>
                                <Badge variant="outline" className="border-red-900 text-red-600 text-[10px]">{p.fouls} flt</Badge>
                            </div>
                        </div>
                    ))}
                    <div className="text-xs text-gray-500 mt-4 mb-2 uppercase">Banquillo</div>
                    {team.players.filter(p => !p.isOnCourt).map(p => (
                        <div key={p.id} className="flex justify-between items-center py-1 border-b border-gray-800 text-sm opacity-60 hover:opacity-100 hover:bg-gray-900 px-1">
                            <div className="flex gap-2 text-gray-300">
                                <span className="font-mono w-6 text-white font-bold">{p.number}</span>
                                <span>{p.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">
            {/* Top Bar */}
            <header className="flex justify-between items-center mb-2">
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-400 hover:text-white gap-2">
                    <ArrowLeft className="h-4 w-4" /> Volver
                </Button>
                <div className="flex gap-4">
                    {!isReadOnly ? (
                        <>
                            <Button
                                variant="secondary"
                                className="bg-blue-900 text-blue-100 hover:bg-blue-800"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert("¡Enlace copiado! Pásalo al público.");
                                }}
                            >
                                🔗 Compartir
                            </Button>
                            <Button variant={isSaving ? "secondary" : "default"} onClick={saveGame} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
                                {isSaving ? "Guardando..." : <><Save className="h-4 w-4 mr-2" /> Guardar</>}
                            </Button>
                        </>
                    ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500 animate-pulse">
                            ● EN VIVO
                        </Badge>
                    )}
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)]">
                {/* Left: Home */}
                {renderTeamPanel("home", "red")}

                {/* Center: Timer & Game Info */}
                <Card className="flex-none w-full lg:w-[300px] bg-gray-950 border-gray-800 p-4 flex flex-col gap-6 items-center">
                    <div className="text-center w-full">
                        <div className="text-gray-500 uppercase text-xs tracking-widest mb-1">Periodo</div>
                        <div className="flex items-center justify-center gap-4 bg-gray-900 rounded p-2">
                            {!isReadOnly && <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={() => updatePeriod(-1)} disabled={gameState.period <= 1}>&lt;</Button>}
                            <span className="text-4xl font-bold text-yellow-500 font-mono">{gameState.period}</span>
                            {!isReadOnly && <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400" onClick={() => updatePeriod(1)} disabled={gameState.period >= 4}>&gt;</Button>}
                        </div>
                    </div>

                    <div className="text-center w-full">
                        <div className="text-gray-500 uppercase text-xs tracking-widest mb-1">Tiempo de Juego</div>
                        <div className={`text-6xl font-mono font-bold tracking-widest mb-4 p-4 rounded bg-black border ${gameState.isTimerRunning ? "border-green-900 text-green-500 shadow-[0_0_15px_rgba(0,255,0,0.2)]" : "border-gray-800 text-gray-300"}`}>
                            {formatTime(gameState.timerSeconds)}
                        </div>
                        {!isReadOnly && (
                            <div className="flex gap-2 justify-center">
                                <Button
                                    size="lg"
                                    className={`w-32 font-bold text-lg ${gameState.isTimerRunning ? "bg-red-900 text-red-100 hover:bg-red-800" : "bg-green-800 text-green-100 hover:bg-green-700"}`}
                                    onClick={toggleTimer}
                                >
                                    {gameState.isTimerRunning ? <><Pause className="mr-2 h-5 w-5" /> PAUSA</> : <><Play className="mr-2 h-5 w-5" /> INICIAR</>}
                                </Button>
                                <Button size="icon" variant="outline" className="border-gray-700 bg-gray-900 text-gray-400 hover:text-white" onClick={resetTimer}>
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Possession Arrow (Mock) */}
                    <div className="w-full bg-gray-900 p-3 rounded mt-auto">
                        <div className="text-xs text-gray-500 uppercase text-center mb-2">Posesión</div>
                        <div className="flex justify-between px-4">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-red-600 border-b-[10px] border-b-transparent opacity-100"></div>
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-blue-900 border-b-[10px] border-b-transparent opacity-20"></div>
                        </div>
                    </div>
                </Card>

                {/* Right: Away */}
                {renderTeamPanel("away", "blue")}
            </div>
        </div>
    );
}
