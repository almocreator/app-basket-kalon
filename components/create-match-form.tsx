"use client";

import { createMatch } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useRef } from "react"; // useState removed

export function CreateMatchForm() {
    const formRef = useRef<HTMLFormElement>(null);
    // Removed isOpen state as this is now a dedicated page form

    return (
        <Card className="w-full max-w-md mx-auto mb-8">
            <CardHeader>
                <CardTitle>Programar Partido</CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    ref={formRef}
                    action={async (formData) => {
                        await createMatch(formData);
                        formRef.current?.reset();
                    }}
                    className="space-y-4"
                >
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                            Título
                        </label>
                        <input
                            id="title"
                            name="title"
                            placeholder="Ej: Partido Viernes"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black"
                            required
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">
                            Fecha y Hora
                        </label>
                        <input
                            id="date"
                            name="date"
                            type="datetime-local"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black"
                            required
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">
                            Ubicación
                        </label>
                        <input
                            id="location"
                            name="location"
                            placeholder="Ej: Pabellón Municipal"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-black"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => window.history.back()}>
                            Cancelar
                        </Button>
                        <Button type="submit">Guardar Partido</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
