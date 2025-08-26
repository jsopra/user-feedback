"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Check } from "lucide-react"
import type { Survey } from "@/types/survey"

interface SurveyEmbedModalProps {
  survey?: Survey
  surveyId?: string
  isOpen: boolean
  onClose: () => void
}

export default function SurveyEmbedModal({ survey, surveyId, isOpen, onClose }: SurveyEmbedModalProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null)

  // Use survey.id se survey estiver disponível, senão use surveyId
  const id = survey?.id || surveyId
  const title = survey?.title || `Survey ${id}`
  const apiKey = survey?.api_key

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
          <DialogTitle>Código de Incorporação - {title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gtm" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gtm">Google Tag Manager</TabsTrigger>
            <TabsTrigger value="html">HTML Direto</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="event">Acionamento Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="gtm" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Google Tag Manager</h3>
              <p className="text-sm text-gray-600 mb-4">Cole este código em uma tag HTML personalizada no GTM</p>
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
              <h4 className="font-medium text-blue-900 mb-2">Instruções GTM:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Acesse seu Google Tag Manager</li>
                <li>Crie uma nova tag do tipo "HTML Personalizado"</li>
                <li>Cole o código acima no campo HTML</li>
                <li>Configure o acionador conforme necessário</li>
                <li>Publique a versão</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">HTML Direto</h3>
              <p className="text-sm text-gray-600 mb-4">Adicione este código diretamente no HTML do seu site</p>
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
              <h4 className="font-medium text-green-900 mb-2">Instruções HTML:</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Cole o código antes do fechamento da tag {"</body>"}</li>
                <li>O widget será carregado automaticamente</li>
                <li>Funciona em qualquer página HTML</li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="js" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">JavaScript Personalizado</h3>
              <p className="text-sm text-gray-600 mb-4">
                Código JavaScript com controle avançado e tratamento de erros
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
              <h4 className="font-medium text-purple-900 mb-2">Recursos Avançados:</h4>
              <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
                <li>Previne carregamento duplicado</li>
                <li>Callbacks de sucesso e erro</li>
                <li>Carregamento assíncrono otimizado</li>
                <li>Compatível com SPA (Single Page Apps)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="event" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Acionamento Manual (Modo Evento)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Para surveys configuradas com acionamento por evento, use esta função JavaScript
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
              <h4 className="font-medium text-orange-900 mb-2">Instruções de Uso:</h4>
              <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
                <li>Configure a survey com "Acionamento: Evento" e "Recorrência: Sempre"</li>
                <li>Carregue o script da survey na página (usando uma das outras abas)</li>
                <li>
                  Chame <code className="bg-orange-100 px-1 rounded">window.UserFeedback.trigger()</code> quando
                  necessário
                </li>
                <li>Passe parâmetros customizados para análise posterior</li>
                <li>Ideal para: finalização de pedidos, ações específicas, experimentos A/B</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Casos de Uso Comuns:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  <strong>E-commerce:</strong> Após finalizar compra, avaliar experiência
                </li>
                <li>
                  <strong>SaaS:</strong> Após completar onboarding, medir satisfação
                </li>
                <li>
                  <strong>Fake Door:</strong> Testar interesse em nova funcionalidade
                </li>
                <li>
                  <strong>Experimentos:</strong> Coletar feedback em pontos específicos
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={testEmbed}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Testar Widget
          </Button>
          {apiKey && (
            <div className="text-xs text-gray-500 flex items-center">
              API Key: <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{apiKey}</code>
            </div>
          )}
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
