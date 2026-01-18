"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Check } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import type { Survey } from "@/types/survey"

interface SurveyEmbedModalProps {
  survey?: Survey
  surveyId?: string
  isOpen: boolean
  onClose: () => void
}

export default function SurveyEmbedModal({ survey, surveyId, isOpen, onClose }: SurveyEmbedModalProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)
  const { t } = useTranslation("surveys")

  // Use survey.id se survey estiver disponível, senão use surveyId
  const id = survey?.id || surveyId
  const title = survey?.title || `Survey ${id}`

  if (!id) {
    return null
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"
  const embedUrl = `${baseUrl}/api/embed/${id}`

  // Código para Google Tag Manager
  const gtmCode = `<script>
(function() {
  var script = document.createElement('script');
  script.src = '${embedUrl}';
  script.async = true;
  script.onerror = function() {
    console.warn('Survey widget failed to load');
  };
  document.head.appendChild(script);
})();
</script>`

  // Código HTML direto
  const htmlCode = `<!-- Survey Widget -->
<script src="${embedUrl}" async></script>`

  // Código JavaScript personalizado
  const jsCode = `// Survey Widget - Carregamento Personalizado
(function() {
  // Verificar se já foi carregado
  if (window.surveyWidget_${id}) return;
  
  var script = document.createElement('script');
  script.src = '${embedUrl}';
  script.async = true;
  
  // Callback de sucesso
  script.onload = function() {
    console.log('Survey widget loaded successfully');
  };
  
  // Callback de erro
  script.onerror = function() {
    console.warn('Survey widget failed to load');
  };
  
  // Marcar como carregado
  window.surveyWidget_${id} = true;
  
  document.head.appendChild(script);
})();`

  // Código para acionamento por evento
  const eventTriggerCode = `// Acionamento Manual da Survey (Modo Evento)
// Use esta função para abrir a survey programaticamente

// Exemplo básico:
window.UserFeedback.trigger('${id}');

// Com parâmetros customizados:
window.UserFeedback.trigger('${id}', {
  userId: '12345',
  pedidoId: 'PED-789',
  valorPedido: 1500,
  tipoFarmacia: 'rede'
});

// Exemplo prático - após finalizar pedido:
function finalizarPedido(pedido) {
  // ... lógica do pedido ...
  
  // Disparar survey de feedback
  window.UserFeedback.trigger('${id}', {
    userId: pedido.userId,
    pedidoId: pedido.id,
    valorPedido: pedido.total,
    categoria: pedido.categoria
  });
}`

  const copyToClipboard = async (text: string, tabId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedTab(tabId)
      setTimeout(() => setCopiedTab(null), 2000)
    } catch (err) {
      console.error("Erro ao copiar:", err)
    }
  }

  const testEmbed = () => {
    window.open(embedUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("embed.title")} - {title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gtm" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gtm">{t("embed.gtmTab")}</TabsTrigger>
            <TabsTrigger value="html">{t("embed.htmlTab")}</TabsTrigger>
            <TabsTrigger value="js">{t("embed.jsTab")}</TabsTrigger>
            <TabsTrigger value="event">{t("embed.eventTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="gtm" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("embed.gtmTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">{t("embed.pasteInGTM")}</p>
            </div>

            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{gtmCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-transparent"
                onClick={() => copyToClipboard(gtmCode, "gtm")}
              >
                {copiedTab === "gtm" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{t("embed.gtmInstructions")}</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>{t("embed.gtmStep1")}</li>
                <li>{t("embed.gtmStep2")}</li>
                <li>{t("embed.gtmStep3")}</li>
                <li>{t("embed.gtmStep4")}</li>
                <li>{t("embed.gtmStep5")}</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("embed.htmlTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">{t("embed.htmlDescription")}</p>
            </div>

            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{htmlCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-transparent"
                onClick={() => copyToClipboard(htmlCode, "html")}
              >
                {copiedTab === "html" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">{t("embed.htmlInstructions")}</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>{t("embed.htmlStep1")}</li>
                <li>{t("embed.htmlStep2")}</li>
                <li>{t("embed.htmlStep3")}</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="js" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("embed.jsTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("embed.jsDescription")}
              </p>
            </div>

            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{jsCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-transparent"
                onClick={() => copyToClipboard(jsCode, "js")}
              >
                {copiedTab === "js" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">{t("embed.advancedFeatures")}</h4>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>{t("embed.jsFeature1")}</li>
                <li>{t("embed.jsFeature2")}</li>
                <li>{t("embed.jsFeature3")}</li>
                <li>{t("embed.jsFeature4")}</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t("embed.eventTitle")}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("embed.eventDescription")}
              </p>
            </div>

            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                <code>{eventTriggerCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-transparent"
                onClick={() => copyToClipboard(eventTriggerCode, "event")}
              >
                {copiedTab === "event" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">{t("embed.eventInstructions")}</h4>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>{t("embed.eventStep1")}</li>
                <li>{t("embed.eventStep2")}</li>
                <li>{t("embed.eventStep3")}</li>
                <li>{t("embed.eventStep4")}</li>
                <li>{t("embed.eventStep5")}</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">{t("embed.useCases")}</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>E-commerce:</strong> {t("embed.useCase1")}</li>
                <li><strong>SaaS:</strong> {t("embed.useCase2")}</li>
                <li><strong>Fake Door:</strong> {t("embed.useCase3")}</li>
                <li><strong>Experimentos:</strong> {t("embed.useCase4")}</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={testEmbed}>
            <ExternalLink className="h-4 w-4 mr-2" />
            {t("embed.testWidget")}
          </Button>
          <Button onClick={onClose}>{t("embed.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
