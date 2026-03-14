import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Liga Deportiva Zambiza</h1>
           <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <section className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Gestión Deportiva Profesional
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Administra tu liga de manera eficiente con todas las herramientas que necesitas
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Comenzar Ahora</Link>
              </Button>
            </div>
          </section>

          <section className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campeonatos</CardTitle>
                <CardDescription>
                  Crea y administra torneos y ligas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestiona calendarios, resultados y posiciones en tiempo real
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipos</CardTitle>
                <CardDescription>
                  Administra equipos y jugadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registra equipos, jugadores, directivos y cuerpo técnico
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Árbitros</CardTitle>
                <CardDescription>
                  Gestión de árbitros y encuentros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Asigna árbitros a partidos y controla sanciones
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Liga Deportiva Zambiza. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
