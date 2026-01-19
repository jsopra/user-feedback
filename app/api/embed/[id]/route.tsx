import { type NextRequest, NextResponse } from "next/server"
import { getDbClient } from "@/lib/dbClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDbClient()
    const surveyId = params.id
    const url = new URL(request.url)
    const isPreview = url.searchParams.get("preview") === "true"
    const isApp = url.searchParams.get("app") === "true"
    const apiKey = url.searchParams.get("key")

    // Get the base URL from the request (where this embed endpoint is hosted)
    const protocol = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host
    const apiBaseUrl = `${protocol}://${host}`

    const { data: survey, error: surveyError } = await db
      .from("surveys")
      .select("*, design_settings, target_settings")
      .eq("id", surveyId)
      .eq("is_active", true)
      .single()

    if (surveyError) {
      return new NextResponse(`console.error('Survey não encontrada ou inativa: ${surveyId}');`, {
        status: 404,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "X-Content-Type-Options": "nosniff",
        },
      })
    }

    let projectData = null
    if (survey?.project_id) {
      const { data: project } = await db
        .from("projects")
        .select("base_domain")
        .eq("id", survey.project_id)
        .single()
      projectData = project
    }

    const { data: pageRules } = await db
      .from("survey_page_rules")
      .select("pattern, rule_type, is_regex")
      .eq("survey_id", surveyId)

    const { data: elements } = await db
      .from("survey_elements")
      .select("id, survey_id, question, type, config, required, order_index")
      .eq("survey_id", surveyId)
      .order("order_index")

    const surveyWithProject = {
      ...survey,
      projects: projectData,
      survey_page_rules: pageRules || [],
    }

    const widgetScript = generateWidgetScript(
      surveyWithProject,
      elements || [],
      isPreview,
      isApp,
      !!apiKey,
      apiBaseUrl
    )

    return new NextResponse(widgetScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar embed:", error)
    return new NextResponse(`console.error('Erro ao carregar survey widget: ${error}');`, {
      status: 500,
      headers: {
        "Content-Type": "application/javascript",
      },
    })
  }
}

function formatJS(code: string): string {
  // Only do basic formatting to ensure clean, readable JavaScript
  // No aggressive minification that breaks syntax
  return code
    .replace(/^\s+/gm, '') // Remove leading whitespace from each line
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
}

function generateWidgetScript(survey: any, elements: any[], isPreview: boolean, isApp: boolean, hasApiKey: boolean, apiBaseUrl: string) {
  const script = `
(function() {
  'use strict';
  
  try {
    var surveyData = ${JSON.stringify(survey)};
    var elementsData = ${JSON.stringify(elements)};
    var isPreview = ${isPreview};
    var isApp = ${isApp};
    var hasApiKey = ${hasApiKey};
    // API Base URL is dynamically set from the server hosting this script
    var apiBaseUrl = '${apiBaseUrl}';
    
    // Double check that we have a proper absolute URL
    if (!apiBaseUrl.startsWith('http')) {
      console.error('Invalid API Base URL:', apiBaseUrl);
      apiBaseUrl = window.location.protocol + '//' + window.location.host;
    }
    
    var designSettings = surveyData.design_settings || {};
    var targetSettings = surveyData.target_settings || {};
    
    var config = {
      colors: {
        primary: designSettings.primaryColor || '#007bff',
        background: designSettings.backgroundColor || '#ffffff',
        text: designSettings.textColor || '#333333',
        border: designSettings.borderColor || '#e5e7eb'
      },
      position: targetSettings.position || designSettings.widgetPosition || 'bottom-right',
      size: targetSettings.size || 'medium',
      delayTime: targetSettings.delay || 0,
      triggerMode: targetSettings.triggerMode || 'time',
      recurrence: targetSettings.recurrence || 'one_response',
      recurrenceConfig: targetSettings.recurrenceConfig || {}
    };
    
    var currentStep = 0;
    var responses = {};
    var isCompleted = false;
    var isSubmitting = false;
    var widgetNamespace = 'surveyWidget_' + surveyData.id.replace(/-/g,'_') + '_' + Math.random().toString(36).slice(2,8);
    var sessionId = 'embed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    var exposureTracked = false;
    var hitTracked = false;
    var showSoftGate = designSettings.softGate !== false; // Default to true if not set
    var customParams = {};
    
    if (!window.UserFeedback) {
      window.UserFeedback = {};
    }
    
    function getDeviceType(userAgent) {
      var ua = userAgent.toLowerCase();
      
      if (/ipad/.test(ua)) return 'tablet';
      if (/android.*tablet|android.*pad/.test(ua)) return 'tablet';
      if (/iphone|android.*mobile|mobile|phone/.test(ua)) return 'mobile';
      
      return 'desktop';
    }
    
    function trackHit() {
      if (hitTracked) return;
      
      var hitData = {
        sessionId: sessionId,
        route: window.location.pathname,
        device: getDeviceType(navigator.userAgent),
        userAgent: navigator.userAgent,
        custom_params: customParams,
        trigger_mode: config.triggerMode
      };
      
      // Construct absolute URL for hit tracking
      var apiUrl = apiBaseUrl + '/api/surveys/' + surveyData.id + '/hits';
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hitData)
      }).then(function(response) {
        if (response.ok) {
          hitTracked = true;
        }
      }).catch(function(error) {
        console.error('Error tracking hit:', error);
      });
    }
    
    function trackExposure() {
      if (exposureTracked) return;
      
      var exposureData = {
        sessionId: sessionId,
        route: window.location.pathname,
        device: getDeviceType(navigator.userAgent),
        userAgent: navigator.userAgent,
        custom_params: customParams,
        trigger_mode: config.triggerMode
      };
      
      // Construct absolute URL for exposure tracking
      var apiUrl = apiBaseUrl + '/api/surveys/' + surveyData.id + '/exposures';
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exposureData)
      }).then(function(response) {
        if (response.ok) {
          exposureTracked = true;
        }
      }).catch(function(error) {
        console.error('Error tracking exposure:', error);
      });
    }
    
    function checkPageRules() {
      if (!surveyData.survey_page_rules || surveyData.survey_page_rules.length === 0) {
        return false;
      }
      
      var currentUrl = window.location.href;
      var currentPath = window.location.pathname;
      
      
      var includeRules = [];
      var excludeRules = [];
      
      for (var i = 0; i < surveyData.survey_page_rules.length; i++) {
        var rule = surveyData.survey_page_rules[i];
        if (rule.rule_type === 'include') {
          includeRules.push(rule);
        } else if (rule.rule_type === 'exclude') {
          excludeRules.push(rule);
        }
      }
      
      
      // Check exclude rules first - if any match, don't show survey
      for (var i = 0; i < excludeRules.length; i++) {
        var rule = excludeRules[i];
        var matches = false;
        
        try {
          if (rule.is_regex) {
            var regex = new RegExp(rule.pattern, 'i');
            matches = regex.test(currentUrl) || regex.test(currentPath);
          } else {
            matches = currentUrl.includes(rule.pattern) || currentPath.includes(rule.pattern);
          }
          
          
          if (matches) {
            return false;
          }
        } catch (error) {
          console.error('Error checking exclude rule:', error);
        }
      }
      
      // If there are include rules, at least one must match
      if (includeRules.length > 0) {
        var hasMatch = false;
        for (var i = 0; i < includeRules.length; i++) {
          var rule = includeRules[i];
          var matches = false;
          
          try {
            if (rule.is_regex) {
              var regex = new RegExp(rule.pattern, 'i');
              matches = regex.test(currentUrl) || regex.test(currentPath);
            } else {
              matches = currentUrl.includes(rule.pattern) || currentPath.includes(rule.pattern);
            }
            
            
            if (matches) {
              hasMatch = true;
              break;
            }
          } catch (error) {
            console.error('Error checking include rule:', error);
          }
        }
        
        if (!hasMatch) {
          return false;
        }
        
        return true;
      }
      
      return false;
    }
    
    function domainAllowed(baseDomainRaw){
      var currentDomain = window.location.hostname;
      try {
        var raw = String(baseDomainRaw || '').trim();
        var base = raw;
        if (raw.indexOf('://') >= 0) {
          // tem protocolo: usa URL para extrair hostname
          try { base = new URL(raw).hostname; } catch (e) { base = raw; }
        }
        // normaliza: tira "www.", porta e path
        base = String(base);
        if (base.indexOf('://') >= 0) base = base.split('://')[1];
        base = base.split('/')[0].split(':')[0];
        if (base.slice(0,4).toLowerCase()==='www.') base = base.slice(4);

        if (!base) return true; // sem restrição => libera

        return (
          currentDomain === base ||
          currentDomain.endsWith('.' + base) ||
          base.endsWith('.' + currentDomain)
        );
      } catch (e) {
        // fallback permissivo em caso de erro de parsing
        return true;
      }
    }
    
    function shouldShowSurvey() {
      if (isPreview) {
        return true;
      }
      if (isApp) {
        return true;
      }
      if (hasApiKey) {
        return true;
      }
      
      if (!checkPageRules()) {
        return false;
      }
      
      if (surveyData.projects && surveyData.projects.base_domain) {
        if (!domainAllowed(surveyData.projects.base_domain)) {
          return false;
        }
      } else {
      }
      
      return true;
    }
    
    function checkRecurrence() {
      
      if (config.recurrence === 'always') {
        return true;
      }
      
      var storageKey = 'survey_response_' + surveyData.id;
      var sessionKey = 'survey_session_' + surveyData.id;
      
      if (config.recurrence === 'one_response') {
        // Check session-level response for this execution
        if (sessionStorage.getItem(sessionKey)) {
          return false;
        }
        return true;
      }
      
      if (config.recurrence === 'time_sequence') {
        var interval = config.recurrenceConfig.interval || 30; // days
        var maxResponses = config.recurrenceConfig.maxResponses || 1;
        
        var responseHistory = JSON.parse(localStorage.getItem(storageKey + '_history') || '[]');
        var now = new Date();
        
        // Filter responses within the interval
        var validResponses = responseHistory.filter(function(timestamp) {
          var responseTime = new Date(timestamp);
          var diffDays = (now - responseTime) / (1000 * 60 * 60 * 24);
          return diffDays <= interval;
        });
        
        
        if (validResponses.length >= maxResponses) {
          return false;
        }
        
        return true;
      }
      
      return true;
    }
    
    function getPositionStyles(position) {
      var positions = {
        'top-left': 'top: 20px; left: 20px;',
        'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
        'top-right': 'top: 20px; right: 20px;',
        'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);',
        'center-center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);',
        'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
        'bottom-left': 'bottom: 20px; left: 20px;',
        'bottom-center': 'bottom: 20px; left: 50%; transform: translateX(-50%);',
        'bottom-right': 'bottom: 20px; right: 20px;'
      };
      var result = positions[position] || positions['bottom-right'];
      return result;
    }
    
    function getSizeStyles(size) {
      var sizes = {
        'small': 'width: 280px;',
        'medium': 'width: 320px;',
        'large': 'width: 400px;'
      };
      var result = sizes[size] || sizes['medium'];
      return result;
    }
    
    function createSoftGate() {
      
      if (!shouldShowSurvey() || !checkRecurrence()) {
        return;
      }
      
      trackHit();
      
      var existingWidget = document.getElementById('survey-widget-' + surveyData.id);
      if (existingWidget) {
        existingWidget.remove();
      }
      
      var widget = document.createElement('div');
      widget.id = 'survey-widget-' + surveyData.id;
      
      var positionStyles = getPositionStyles(config.position);
      var baseStyles = [
        'position: fixed;',
        'min-width: 280px;',
        'max-width: 400px;',
        'background: ' + config.colors.background + ';',
        'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);',
        'border: 1px solid ' + config.colors.border + ';',
        'border-radius: 8px;',
        'z-index: 999999;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
        'transition: all 0.3s ease;',
        positionStyles
      ].join(' ');
      
      widget.style.cssText = baseStyles;
      
      var html = '';
      html += '<div style="padding: 12px 16px;">';
      html += '<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">';
      
      html += '<p style="font-size: 12px; margin: 0; color: ' + config.colors.text + '; flex: 1;">Podemos te fazer algumas perguntas rápidas?</p>';
      
      html += '<div style="display: flex; align-items: center; gap: 8px;">';
      html += '<button onclick="window.' + widgetNamespace + '.acceptSoftGate()" style="display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; height: 28px;">👍 Sim</button>';
      html += '<button onclick="window.' + widgetNamespace + '.rejectSoftGate()" style="display: flex; align-items: center; gap: 4px; padding: 6px 12px; background: transparent; color: ' + config.colors.text + '; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; font-size: 12px; height: 28px;">👎 Não</button>';
      html += '</div>';
      
      html += '</div>';
      html += '</div>';
      
      widget.innerHTML = html;
      
      window[widgetNamespace] = {
        acceptSoftGate: function() {
          showSoftGate = false;
          trackExposure();
          createSurveyWidget();
        },
        
        rejectSoftGate: function() {
          if (widget && widget.parentNode) {
            widget.parentNode.removeChild(widget);
          }
          if (window[widgetNamespace]) {
            delete window[widgetNamespace];
          }
        }
      };
      
      document.body.appendChild(widget);
    }
    
    function createSurveyWidget() {
      
      if (elementsData.length === 0) {
        return;
      }
      
      var existingWidget = document.getElementById('survey-widget-' + surveyData.id);
      if (existingWidget) {
        existingWidget.remove();
      }
      
      var widget = document.createElement('div');
      widget.id = 'survey-widget-' + surveyData.id;
      
      var positionStyles = getPositionStyles(config.position);
      var sizeStyles = getSizeStyles(config.size);
      
      var baseStyles = [
        'position: fixed;',
        sizeStyles,
        'background: ' + config.colors.background + ';',
        'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);',
        'border: 1px solid ' + config.colors.border + ';',
        'border-radius: 8px;',
        'z-index: 999999;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
        'transition: all 0.3s ease;',
        positionStyles
      ].join(' ');
      
      widget.style.cssText = baseStyles;

      function validateCurrentStep() {
        var currentElement = elementsData[currentStep];
        if (!currentElement.required) {
          return { isValid: true, message: '' };
        }
        
        var value = getElementValue(currentElement);
        var isEmpty = false;
        
        if (Array.isArray(value)) {
          isEmpty = value.length === 0;
        } else if (value === null || value === undefined) {
          isEmpty = true;
        } else {
          isEmpty = value.toString().trim() === '';
        }
        
        if (isEmpty) {
          var fieldType = currentElement.type === 'multiple_choice' ? 'uma opção' : 
                          currentElement.type === 'rating' ? 'uma avaliação' : 'este campo';
          return {
            isValid: false,
            message: 'Por favor, selecione ' + fieldType + ' antes de continuar.'
          };
        }
        
        return { isValid: true, message: '' };
      }
      
      function showValidationError(message) {
        var errorId = 'validation-error-' + surveyData.id;
        var existingError = document.getElementById(errorId);
        if (existingError) {
          existingError.remove();
        }
        
        var errorDiv = document.createElement('div');
        errorDiv.id = errorId;
        errorDiv.style.cssText = [
          'background: #fef2f2;',
          'border: 1px solid #fecaca;',
          'color: #dc2626;',
          'padding: 8px 12px;',
          'border-radius: 6px;',
          'font-size: 12px;',
          'margin: 8px 0;',
          'display: flex;',
          'align-items: center;',
          'animation: fadeIn 0.3s ease;'
        ].join(' ');
        
        errorDiv.innerHTML = '<span style="margin-right: 6px;">⚠️</span>' + message;
        
        var questionContainer = widget.querySelector('label').parentNode;
        questionContainer.appendChild(errorDiv);
        
        setTimeout(function() {
          if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
          }
        }, 5000);
      }
      
      function clearValidationError() {
        var errorId = 'validation-error-' + surveyData.id;
        var existingError = document.getElementById(errorId);
        if (existingError) {
          existingError.remove();
        }
      }
      
      function renderWidget() {
        
        if (isCompleted) {
          renderCompletionScreen();
          return;
        }
        
        var currentElement = elementsData[currentStep];
        var progress = ((currentStep + 1) / elementsData.length) * 100;
        
        var html = '';
        html += '<div style="padding: 16px;">';
        
        html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">';
        html += '<h3 style="margin: 0; font-size: 16px; font-weight: 600; color: ' + config.colors.text + ';">' + (surveyData.title || 'Survey') + '</h3>';
        html += '<button onclick="window.' + widgetNamespace + '.closeSurvey()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9ca3af; padding: 4px; line-height: 1; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">×</button>';
        html += '</div>';
        
        html += '<div style="margin-bottom: 16px;">';
        html += '<div style="width: 100%; background-color: #e5e7eb; border-radius: 9999px; height: 4px;">';
        html += '<div style="background-color: ' + config.colors.primary + '; height: 4px; border-radius: 9999px; transition: width 0.3s ease; width: ' + progress + '%;"></div>';
        html += '</div>';
        html += '<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">' + (currentStep + 1) + ' de ' + elementsData.length + '</p>';
        html += '</div>';
        
        html += '<div style="margin-bottom: 16px;">';
        html += '<label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: ' + config.colors.text + ';">';
        html += currentElement.question || 'Pergunta ' + (currentStep + 1);
        if (currentElement.required) {
          html += '<span style="color: #ef4444; margin-left: 4px;">*</span>';
        }
        html += '</label>';
        
        html += renderElement(currentElement);
        html += '</div>';
        
        html += '<div style="display: flex; justify-content: space-between;">';
        if (currentStep > 0) {
          html += '<button onclick="window.' + widgetNamespace + '.previousStep()" style="padding: 8px 16px; background: transparent; color: ' + config.colors.text + '; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 14px;">Anterior</button>';
        } else {
          html += '<div></div>';
        }
        
        var nextButtonText = currentStep === elementsData.length - 1 ? 'Finalizar' : 'Próximo';
        var nextButtonId = 'next-button-' + surveyData.id;
        html += '<button id="' + nextButtonId + '" onclick="window.' + widgetNamespace + '.nextStep()" style="padding: 8px 16px; background: ' + config.colors.primary + '; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">' + nextButtonText + '</button>';
        html += '</div>';
        
        html += '</div>';
        
        widget.innerHTML = html;
        
        var inputs = widget.querySelectorAll('input, textarea, select');
        for (var i = 0; i < inputs.length; i++) {
          inputs[i].addEventListener('input', clearValidationError);
          inputs[i].addEventListener('change', clearValidationError);
        }

        if (elementsData[currentStep].type === 'rating') {
          var container = widget.querySelector('#rating-container-' + currentStep);
          var stars = widget.querySelectorAll('.rating-star-' + currentStep);
          if (container && stars.length) {
            var currentVal = parseInt(container.getAttribute('data-value') || '0', 10);
            function updateStars(val) {
              container.setAttribute('data-value', String(val));
              stars.forEach(function(star, idx) {
                var starVal = idx + 1;
                star.style.color = starVal <= val ? config.colors.primary : '#d1d5db';
              });
              clearValidationError();
            }
            stars.forEach(function(star) {
              var val = parseInt(star.getAttribute('data-value') || '0', 10);
              star.addEventListener('click', function() {
                updateStars(val);
              });
            });
            // Ensure initial visual state is synced
            updateStars(currentVal);
          }
        }
      }
      
      function renderElement(element) {
        var html = '';
        var placeholder = (element.config && element.config.placeholder) || 'Digite sua resposta...';
        
        switch (element.type) {
          case 'text':
          case 'email':
          case 'number':
            var inputType = element.type === 'email' ? 'email' : (element.type === 'number' ? 'number' : 'text');
            html += '<input type="' + inputType + '" id="response-' + currentStep + '" placeholder="' + placeholder + '" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; color: ' + config.colors.text + '; box-sizing: border-box;" />';
            break;
            
          case 'textarea':
            html += '<textarea id="response-' + currentStep + '" placeholder="' + placeholder + '" rows="3" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; color: ' + config.colors.text + '; resize: vertical; box-sizing: border-box;"></textarea>';
            break;
            
          case 'multiple_choice':
            if (element.config && element.config.options) {
              html += '<div style="margin: 8px 0;">';
              for (var i = 0; i < element.config.options.length; i++) {
                var option = element.config.options[i];
                var inputType = element.config.allowMultiple ? 'checkbox' : 'radio';
                html += '<label style="display: flex; align-items: center; margin: 8px 0; cursor: pointer;">';
                html += '<input type="' + inputType + '" name="response-' + currentStep + '" value="' + option + '" style="margin-right: 8px;" />';
                html += '<span style="font-size: 14px; color: ' + config.colors.text + ';">' + option + '</span>';
                html += '</label>';
              }
              html += '</div>';
            }
            break;
            
          case 'rating':
            var min = (element.config && element.config.ratingRange && element.config.ratingRange.min) || 1;
            var max = (element.config && element.config.ratingRange && element.config.ratingRange.max) || 5;
            var defaultValue = (element.config && element.config.ratingRange && element.config.ratingRange.defaultValue) || min;
            var currentValue = responses[element.id] || defaultValue;
            html += '<div style="margin:12px 0; display:flex; gap:6px; align-items:center;" id="rating-container-' + currentStep + '" data-value="' + currentValue + '" data-max="' + max + '">';
            for (var r = 1; r <= max; r++) {
              var color = r <= currentValue ? config.colors.primary : '#d1d5db';
              html += '<span class="rating-star-' + currentStep + '" data-value="' + r + '" style="cursor:pointer;font-size:22px;line-height:1;color:' + color + ';user-select:none;">★</span>';
            }
            html += '</div>';
            break;
            
          default:
            html += '<input type="text" id="response-' + currentStep + '" placeholder="' + placeholder + '" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; color: ' + config.colors.text + '; box-sizing: border-box;" />';
        }
        
        return html;
      }
      
      function renderCompletionScreen() {
        var html = '';
        html += '<div style="padding: 24px; text-align: center; transition: all 0.3s ease;">';
        html += '<div style="margin-bottom: 16px;">';
        html += '<div style="width: 64px; height: 64px; margin: 0 auto; background: ' + config.colors.primary + '; border-radius: 50%; display: flex; align-items: center; justify-content: center;">';
        html += '<span style="color: white; font-size: 24px;">✓</span>';
        html += '</div>';
        html += '</div>';
        html += '<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: ' + config.colors.text + ';">Pesquisa Concluída!</h3>';
        html += '<div style="font-size: 12px; color: #9ca3af;">Fechando automaticamente em alguns segundos...</div>';
        html += '</div>';
        
        widget.innerHTML = html;
        
        setTimeout(function () {
          if (window[widgetNamespace]) window[widgetNamespace].closeSurvey();
        }, 3000);
      }
      
      function getElementValue(element) {
        var value = '';
        
        if (element.type === 'multiple_choice') {
          if (element.config && element.config.allowMultiple) {
            var checkboxes = widget.querySelectorAll('input[name="response-' + currentStep + '"]:checked');
            var values = [];
            for (var i = 0; i < checkboxes.length; i++) {
              values.push(checkboxes[i].value);
            }
            value = values;
          } else {
            var radio = widget.querySelector('input[name="response-' + currentStep + '"]:checked');
            value = radio ? radio.value : '';
          }
        } else if (element.type === 'rating') {
          var ratingContainer = widget.querySelector('#rating-container-' + currentStep);
          var ratingValue = ratingContainer ? parseInt(ratingContainer.getAttribute('data-value') || '0', 10) : 0;
          value = ratingValue;
        } else {
          var input = widget.querySelector('#response-' + currentStep);
          value = input ? input.value : '';
        }
        
        return value;
      }
      
      function submitResponses() {
        
        var formattedResponses = {};
        
        elementsData.forEach(function(element, index) {
          var response = responses[element.id];
          if (response !== null && response !== undefined && response !== '') {
            formattedResponses[index.toString()] = response;
          }
        });
        
        var requestBody = {
          responses: formattedResponses,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          custom_params: customParams,
          trigger_mode: config.triggerMode
        };
        
        // Construct absolute URL for response submission
        var apiUrl = apiBaseUrl + '/api/surveys/' + surveyData.id + '/responses';
        
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }).then(function(response) {
          if (response.ok) {
            // Track response completion based on recurrence mode
            var now = new Date().toISOString();
            var storageKey = 'survey_response_' + surveyData.id;
            var sessionKey = 'survey_session_' + surveyData.id;
            
            if (config.recurrence === 'one_response') {
              // Mark as responded in current session
              sessionStorage.setItem(sessionKey, now);
            } else if (config.recurrence === 'time_sequence') {
              // Add to response history for time-based tracking
              var responseHistory = JSON.parse(localStorage.getItem(storageKey + '_history') || '[]');
              responseHistory.push(now);
              
              // Keep only recent responses (last year) to prevent storage bloat
              var oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
              responseHistory = responseHistory.filter(function(timestamp) {
                return new Date(timestamp) > oneYearAgo;
              });
              
              localStorage.setItem(storageKey + '_history', JSON.stringify(responseHistory));
            }
            // For 'always' mode, we don't store anything to allow repeated responses
            
            isCompleted = true;
            renderWidget();
          } else {
            // Log response details for debugging
            response.text().then(function(text) {
              console.error('API Error Response:', response.status, text);
            });
            showValidationError('Erro ao enviar respostas. Tente novamente.');
            resetSubmitButton();
          }
        }).catch(function(error) {
          console.error('Error submitting response:', error);
          showValidationError('Erro de conexão. Verifique sua internet e tente novamente.');
          resetSubmitButton();
        });
      }
      
      function resetSubmitButton() {
        isSubmitting = false;
        var nextButton = widget.querySelector('#next-button-' + surveyData.id);
        if (nextButton) {
          nextButton.textContent = 'Finalizar';
          nextButton.style.opacity = '1';
          nextButton.style.cursor = 'pointer';
        }
      }
      
      window[widgetNamespace] = {
        nextStep: function() {
          if (isSubmitting) return;
          
          
          var validation = validateCurrentStep();
          if (!validation.isValid) {
            showValidationError(validation.message);
            return;
          }
          
          var currentElement = elementsData[currentStep];
          var value = getElementValue(currentElement);
          
          responses[currentElement.id] = value;
          
          if (currentStep < elementsData.length - 1) {
            currentStep++;
            renderWidget();
          } else {
            isSubmitting = true;
            var nextButton = widget.querySelector('#next-button-' + surveyData.id);
            if (nextButton) {
              nextButton.textContent = 'Enviando...';
              nextButton.style.opacity = '0.6';
              nextButton.style.cursor = 'not-allowed';
            }
            
            submitResponses();
          }
        },
        
        previousStep: function() {
          if (currentStep > 0) {
            clearValidationError();
            currentStep--;
            renderWidget();
          }
        },
        
        closeSurvey: function() {
          if (widget && widget.parentNode) {
            widget.parentNode.removeChild(widget);
          }
          
          // Cleanup event listeners if in event mode
          if (window[widgetNamespace + '_cleanup']) {
            window[widgetNamespace + '_cleanup']();
            delete window[widgetNamespace + '_cleanup'];
          }
          
          if (window[widgetNamespace]) {
            delete window[widgetNamespace];
          }
        }
      };
      
      document.body.appendChild(widget);
      renderWidget();
    }
    
    function initializeWidget() {
      
      if (config.triggerMode === 'event') {
        
        // Listen for custom survey trigger event
        var eventName = 'showSurvey_' + surveyData.id;
        var globalEventName = 'showUserFeedbackSurvey';
        
        function handleSurveyEvent(event) {
          if (event.detail && event.detail.surveyId && event.detail.surveyId !== surveyData.id) {
            return;
          }
          if (showSoftGate) {
            createSoftGate();
          } else {
            console.log('Soft gate disabled - going directly to survey');
            if (!shouldShowSurvey() || !checkRecurrence()) {
              console.log('Survey should not be shown');
              return;
            }
            trackHit();
            trackExposure();
            createSurveyWidget();
          }
        }
        
        // Listen for survey-specific event
        document.addEventListener(eventName, handleSurveyEvent);
        
        // Listen for global event with survey ID in detail
        document.addEventListener(globalEventName, handleSurveyEvent);
        
        
        // Store cleanup function
        window[widgetNamespace + '_cleanup'] = function() {
          document.removeEventListener(eventName, handleSurveyEvent);
          document.removeEventListener(globalEventName, handleSurveyEvent);
        };
        
        return;
      }
      
      // Time-based triggering with delay
      var delayMs = Math.max(0, config.delayTime * 1000);
      
      if (delayMs > 0) {
        setTimeout(function() {
          if (!isPreview && !isApp && !hasApiKey) {
            // Double-check conditions before showing (they might have changed)
            if (shouldShowSurvey() && checkRecurrence()) {
              if (showSoftGate) {
                createSoftGate();
              } else {
                console.log('Soft gate disabled - going directly to survey');
                trackHit();
                trackExposure();
                createSurveyWidget();
              }
            } else {
            }
          } else {
            if (showSoftGate) {
              createSoftGate();
            } else {
              console.log('Soft gate disabled - going directly to survey');
              trackHit();
              trackExposure();
              createSurveyWidget();
            }
          }
        }, delayMs);
      } else {
        if (showSoftGate) {
          createSoftGate();
        } else {
          console.log('Soft gate disabled - going directly to survey');
          if (!isPreview && !isApp && !hasApiKey) {
            if (shouldShowSurvey() && checkRecurrence()) {
              trackHit();
              trackExposure();
              createSurveyWidget();
            }
          } else {
            trackHit();
            trackExposure();
            createSurveyWidget();
          }
        }
      }
    }
    
    initializeWidget();
    
  } catch (error) {
    console.error('Error in survey widget:', error);
  }
  
})();
`;
  
  return formatJS(script);
}
