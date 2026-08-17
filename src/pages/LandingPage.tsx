import { Hero } from "@/components/landing/Hero"
import { PorQueElegirnos } from "@/components/landing/PorQueElegirnos"
import { ServiciosDestacados } from "@/components/landing/ServiciosDestacados"
import { ComoFunciona } from "@/components/landing/ComoFunciona"
import { CtaBanner } from "@/components/landing/CtaBanner"

export function LandingPage() {
  return (
    <>
      <Hero />
      <PorQueElegirnos />
      <ServiciosDestacados />
      <ComoFunciona />
      <CtaBanner />
    </>
  )
}
