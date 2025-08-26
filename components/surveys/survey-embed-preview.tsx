"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"
import type { Survey } from "@/types/survey"

interface SurveyEmbedPreviewProps {
  survey: Survey
  onClose: () => void
}

export default function SurveyEmbedPreview({ survey, onClose }: SurveyEmbedPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (iframeRef.current) {
      // Criar HTML da página de preview que simula um site real
      const previewHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview da Survey - ${survey.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .preview-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .preview-header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        .preview-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .preview-subtitle {
            font-size: 1.2rem;
            color: #718096;
            margin-bottom: 20px;
        }
        .preview-badge {
            display: inline-block;
            background: #e6fffa;
            color: #234e52;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            border: 2px solid #81e6d9;
        }
        .content-section {
            margin: 40px 0;
            padding: 30px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #4299e1;
        }
        .content-section h2 {
            color: #2d3748;
            margin-bottom: 15px;
        }
        .content-section p {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .feature-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
        }
        .feature-card h3 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        .feature-card p {
            color: #718096;
            font-size: 0.95rem;
            margin: 0;
        }
        .cta-section {
            text-align: center;
            margin: 50px 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
        }
        .cta-section h2 {
            font-size: 2rem;
            margin-bottom: 15px;
        }
        .cta-section p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 25px;
        }
        .cta-button {
            background: white;
            color: #667eea;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
        }
        
        /* Estilos para simular um site real */
        .demo-nav {
            background: #2d3748;
            color: white;
            padding: 15px 0;
            margin: -40px -40px 40px -40px;
            border-radius: 12px 12px 0 0;
        }
        .demo-nav-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .demo-logo {
            font-size: 1.5rem;
            font-weight: 700;
        }
        .demo-menu {
            display: flex;
            gap: 30px;
        }
        .demo-menu a {
            color: white;
            text-decoration: none;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .demo-menu a:hover {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="preview-container">
        <!-- Navegação simulada -->
        <div class="demo-nav">
            <div class="demo-nav-content">
                <div class="demo-logo">Minha Empresa</div>
                <div class="demo-menu">
                    <a href="#">Início</a>
                    <a href="#">Produtos</a>
                    <a href="#">Sobre</a>
                    <a href="#">Contato</a>
                </div>
            </div>
        </div>

        <!-- Conteúdo da página simulada -->
        <div class="preview-header">
            <h1 class="preview-title">Bem-vindo ao Nosso Site</h1>
            <p class="preview-subtitle">Esta é uma simulação de como sua survey aparecerá em um site real</p>
            <div class="preview-badge">🎯 Preview em Tempo Real</div>
        </div>

        <div class="content-section">
            <h2>Sobre Nossa Empresa</h2>
            <p>Somos uma empresa inovadora focada em oferecer as melhores soluções para nossos clientes. Nossa missão é transformar ideias em realidade através de tecnologia de ponta.</p>
            <p>Com anos de experiência no mercado, desenvolvemos produtos que fazem a diferença na vida das pessoas e no crescimento dos negócios.</p>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <h3>🚀 Inovação</h3>
                <p>Sempre na vanguarda da tecnologia, oferecendo soluções modernas e eficientes.</p>
            </div>
            <div class="feature-card">
                <h3>🎯 Qualidade</h3>
                <p>Compromisso com a excelência em todos os nossos produtos e serviços.</p>
            </div>
            <div class="feature-card">
                <h3>🤝 Suporte</h3>
                <p>Atendimento personalizado e suporte técnico especializado 24/7.</p>
            </div>
        </div>

        <div class="cta-section">
            <h2>Pronto para Começar?</h2>
            <p>Junte-se a milhares de clientes satisfeitos e transforme seu negócio hoje mesmo.</p>
            <button class="cta-button">Começar Agora</button>
        </div>

        <div class="footer">
            <p>&copy; 2024 Minha Empresa. Todos os direitos reservados.</p>
            <p><small>Esta é uma página de demonstração para preview da survey</small></p>
        </div>
    </div>

    <!-- Script da Survey - EXATAMENTE o mesmo que será usado em produção -->
    <script>
        // Aguardar carregamento completo da página
        window.addEventListener('load', function() {
            // Simular delay de carregamento real
            setTimeout(function() {
                // Carregar script da survey
                var script = document.createElement('script');
                script.src = '${window.location.origin}/api/embed/${survey.id}';
                script.async = true;
                script.onerror = function() {
                    console.error('Erro ao carregar script da survey');
                };
                document.head.appendChild(script);
            }, 1000); // Delay de 1 segundo para simular carregamento real
        });

        // Comunicar com o parent quando a survey for carregada
        window.addEventListener('message', function(event) {
            if (event.data.type === 'survey-loaded') {
                parent.postMessage({ type: 'preview-ready' }, '*');
            }
        });
    </script>
</body>
</html>`

      // Criar blob URL para o HTML
      const blob = new Blob([previewHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      // Definir src do iframe
      iframeRef.current.src = url

      // Cleanup
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [survey])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const openInNewTab = () => {
    if (iframeRef.current?.src) {
      window.open(iframeRef.current.src, "_blank")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="ml-4 text-sm text-gray-600 font-mono">Preview: {survey.title}</div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={openInNewTab} className="text-xs bg-transparent">
              <ExternalLink className="h-3 w-3 mr-1" />
              Nova Aba
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando preview da survey...</p>
              <p className="text-sm text-gray-500 mt-2">Simulando comportamento real do embed</p>
            </div>
          </div>
        )}

        {/* Iframe */}
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title={`Preview: ${survey.title}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>

        {/* Footer Info */}
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-600 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Script Real de Produção
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Respostas Salvas no Banco
              </span>
            </div>
            <div className="text-gray-500">
              Posição: {survey.design?.widgetPosition || "bottom-right"} | Delay: {survey.target?.delay || 0}s
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
