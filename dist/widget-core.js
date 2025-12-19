/**
 * D365 Modern Chat Widget - Core
 * This is the main widget code that gets loaded via the loader
 * Version: 2.0.0
 */
(function() {
  'use strict';
  
  // Prevent double initialization
  if (window.D365ModernChatWidget) {
    console.log('D365 Widget already initialized');
    return;
  }
  
  window.D365ModernChatWidget = {
    version: '2.0.0',
    initialized: false
  };

  // Get config from global or wait for it
  function getConfig() {
    return window.D365WidgetConfig || {};
  }

  // Analytics tracking - sends anonymous usage data (NO user messages!)
  function trackEvent(eventType) {
    try {
      var domain = window.location.hostname || 'unknown';
      var event = {
        type: eventType, // 'load', 'chat', 'call'
        domain: domain,
        timestamp: new Date().toISOString()
      };

      console.log('📊 TRACKING EVENT:', eventType, 'Domain:', domain);

      // Store locally for demo purposes
      var analytics = JSON.parse(localStorage.getItem('d365WidgetAnalytics') || '{"totalLoads":0,"totalChats":0,"totalCalls":0,"domains":{},"events":[]}');
      
      // Update counters
      if (eventType === 'load') analytics.totalLoads++;
      if (eventType === 'chat') analytics.totalChats++;
      if (eventType === 'call') analytics.totalCalls++;
      
      // Track domains
      analytics.domains[domain] = (analytics.domains[domain] || 0) + 1;
      
      // Add event to timeline (keep last 100)
      analytics.events.unshift(event);
      if (analytics.events.length > 100) analytics.events = analytics.events.slice(0, 100);
      
      localStorage.setItem('d365WidgetAnalytics', JSON.stringify(analytics));
      console.log('✅ Analytics saved to localStorage:', analytics);

      // TODO: Send to Cloudflare Worker endpoint when configured
      // fetch('YOUR_CLOUDFLARE_WORKER_URL/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // }).catch(function() { /* silently fail */ });
    } catch (e) {
      console.error('❌ Analytics tracking error:', e);
    }
  }

  // Icon SVG paths
  var iconPaths = {
    chat_multiple: 'M9.56158 3C5.41944 3 2.06158 6.35786 2.06158 10.5C2.06158 11.6329 2.31325 12.7088 2.76423 13.6734C2.5102 14.6714 2.22638 15.7842 2.03999 16.5147C1.80697 17.428 2.6294 18.2588 3.54374 18.039C4.29396 17.8587 5.44699 17.5819 6.47447 17.337C7.41678 17.7631 8.46241 18 9.56158 18C13.7037 18 17.0616 14.6421 17.0616 10.5C17.0616 6.35786 13.7037 3 9.56158 3ZM3.56158 10.5C3.56158 7.18629 6.24787 4.5 9.56158 4.5C12.8753 4.5 15.5616 7.18629 15.5616 10.5C15.5616 13.8137 12.8753 16.5 9.56158 16.5C8.60084 16.5 7.69487 16.2748 6.89161 15.8749L6.6482 15.7537L6.38368 15.8167C5.46095 16.0363 4.39489 16.2919 3.59592 16.4838C3.79467 15.7047 4.05784 14.6724 4.28601 13.7757L4.35619 13.4998L4.22568 13.2468C3.80145 12.4246 3.56158 11.4914 3.56158 10.5ZM14.5616 21.0001C12.5922 21.0001 10.8001 20.241 9.46191 18.9995C9.49511 18.9999 9.52835 19.0001 9.56163 19.0001C10.2796 19.0001 10.9768 18.911 11.6427 18.7434C12.5067 19.2254 13.5021 19.5001 14.5616 19.5001C15.5223 19.5001 16.4283 19.2748 17.2316 18.8749L17.475 18.7537L17.7395 18.8167C18.6611 19.0361 19.7046 19.2625 20.4162 19.4262C20.2412 18.6757 20.0025 17.6711 19.7747 16.7757L19.7045 16.4999L19.835 16.2469C20.2592 15.4247 20.4991 14.4915 20.4991 13.5001C20.4991 11.3853 19.4051 9.52617 17.7521 8.45761C17.5738 7.73435 17.3028 7.04756 16.9525 6.41052C19.8898 7.42684 21.9991 10.2171 21.9991 13.5001C21.9991 14.6332 21.7473 15.7094 21.2961 16.6741C21.5492 17.6821 21.8054 18.774 21.9679 19.4773C22.1723 20.3623 21.3929 21.1633 20.5005 20.9768C19.7733 20.8248 18.6308 20.581 17.587 20.3367C16.6445 20.763 15.5986 21.0001 14.5616 21.0001Z',
    chat_multiple_checkmark: 'M13.0606 8.99827C13.3357 8.68869 13.3079 8.21463 12.9983 7.93944C12.6887 7.66425 12.2146 7.69214 11.9394 8.00173L8.44187 11.9365L7.0029 10.6359C6.69561 10.3582 6.22134 10.3821 5.94359 10.6894C5.66585 10.9967 5.6898 11.471 5.9971 11.7487L7.9971 13.5564C8.14546 13.6905 8.34124 13.7598 8.54094 13.7489C8.74063 13.738 8.92769 13.6477 9.06056 13.4983L13.0606 8.99827ZM2.06158 10.5C2.06158 6.35786 5.41944 3 9.56158 3C13.7037 3 17.0616 6.35786 17.0616 10.5C17.0616 14.6421 13.7037 18 9.56158 18C8.46241 18 7.41678 17.7631 6.47447 17.337C5.44699 17.5819 4.29396 17.8587 3.54374 18.039C2.6294 18.2588 1.80697 17.428 2.03999 16.5147C2.22638 15.7842 2.5102 14.6714 2.76423 13.6734C2.31325 12.7088 2.06158 11.6329 2.06158 10.5ZM9.56158 4.5C6.24787 4.5 3.56158 7.18629 3.56158 10.5C3.56158 11.4914 3.80145 12.4246 4.22568 13.2468L4.35619 13.4998L4.28601 13.7757C4.05784 14.6724 3.79467 15.7047 3.59592 16.4838C4.39489 16.2919 5.46095 16.0363 6.38368 15.8167L6.6482 15.7537L6.89161 15.8749C7.69487 16.2748 8.60084 16.5 9.56158 16.5C12.8753 16.5 15.5616 13.8137 15.5616 10.5C15.5616 7.18629 12.8753 4.5 9.56158 4.5ZM9.46191 18.9995C10.8001 20.241 12.5922 21.0001 14.5616 21.0001C15.6611 21.0001 16.707 20.763 17.6495 20.3367C18.6933 20.581 19.8358 20.8248 20.563 20.9768C21.4554 21.1633 22.2348 20.3623 22.0304 19.4773C21.8679 18.774 21.6117 17.6821 21.3586 16.6741C21.8098 15.7094 22.0616 14.6332 22.0616 13.5001C22.0616 10.2171 19.9523 7.42684 17.015 6.41052C17.3653 7.04756 17.6363 7.73435 17.8146 8.45761C19.4676 9.52617 20.5616 11.3853 20.5616 13.5001C20.5616 14.4915 20.3217 15.4247 19.8975 16.2469L19.767 16.4999L19.8372 16.7757C20.065 17.6711 20.3037 18.6757 20.4787 19.4262C19.7046 19.2625 18.6611 19.0361 17.7395 18.8167L17.475 18.7537L17.2316 18.8749C16.4283 19.2748 15.5223 19.5001 14.5616 19.5001C13.5021 19.5001 12.5067 19.2254 11.6427 18.7434C10.9768 18.911 10.2796 19.0001 9.56163 19.0001C9.52835 19.0001 9.49511 18.9999 9.46191 18.9995Z',
    chat_sparkle: 'M16.0883 6.41228C16.016 6.31886 15.9377 6.2298 15.8539 6.14569C15.5417 5.83255 15.1606 5.59666 14.741 5.45683L13.3632 5.00939C13.257 4.97196 13.165 4.90253 13.1 4.81068C13.0349 4.71883 13 4.60908 13 4.49656C13 4.38404 13.0349 4.27429 13.1 4.18244C13.165 4.09058 13.257 4.02116 13.3632 3.98372L14.741 3.53628C15.1547 3.39352 15.5299 3.15705 15.837 2.84537C16.1357 2.54224 16.3623 2.17595 16.5 1.77372L16.5114 1.73963L16.9592 0.362894C16.9967 0.256782 17.0662 0.164895 17.1581 0.0998993C17.25 0.0349035 17.3598 0 17.4724 0C17.5851 0 17.6949 0.0349035 17.7868 0.0998993C17.8787 0.164895 17.9482 0.256782 17.9857 0.362894L18.4335 1.73963C18.5727 2.15819 18.8077 2.53853 19.1198 2.85041C19.432 3.1623 19.8126 3.39715 20.2315 3.53628L21.6093 3.98372L21.6368 3.99061C21.743 4.02804 21.835 4.09747 21.9 4.18932C21.9651 4.28117 22 4.39092 22 4.50344C22 4.61596 21.9651 4.72571 21.9 4.81756C21.835 4.90942 21.743 4.97884 21.6368 5.01628L20.259 5.46372C19.8402 5.60285 19.4595 5.8377 19.1474 6.14959C18.8353 6.46147 18.6003 6.84181 18.461 7.26037L18.0132 8.63711C18.0092 8.64855 18.0048 8.65983 18 8.67093C17.9605 8.76273 17.8964 8.84212 17.8144 8.9001C17.7224 8.9651 17.6126 9 17.5 9C17.3874 9 17.2776 8.9651 17.1856 8.9001C17.0937 8.8351 17.0242 8.74322 16.9868 8.63711L16.539 7.26037C16.4378 6.95331 16.2851 6.66664 16.0883 6.41228ZM23.7829 10.2132L23.0175 9.9646C22.7848 9.8873 22.5733 9.75683 22.3999 9.58356C22.2265 9.41029 22.0959 9.199 22.0186 8.96646L21.7698 8.20161C21.749 8.14266 21.7104 8.09161 21.6593 8.0555C21.6083 8.01939 21.5473 8 21.4847 8C21.4221 8 21.3611 8.01939 21.31 8.0555C21.259 8.09161 21.2204 8.14266 21.1996 8.20161L20.9508 8.96646C20.875 9.19736 20.7467 9.40761 20.5761 9.58076C20.4055 9.75392 20.1971 9.88529 19.9672 9.9646L19.2018 10.2132C19.1428 10.234 19.0917 10.2725 19.0555 10.3236C19.0194 10.3746 19 10.4356 19 10.4981C19 10.5606 19.0194 10.6216 19.0555 10.6726C19.0917 10.7236 19.1428 10.7622 19.2018 10.783L19.9672 11.0316C20.2003 11.1093 20.412 11.2403 20.5855 11.4143C20.7589 11.5882 20.8893 11.8003 20.9661 12.0335L21.2149 12.7984C21.2357 12.8573 21.2743 12.9084 21.3254 12.9445C21.3764 12.9806 21.4374 13 21.5 13C21.5626 13 21.6236 12.9806 21.6746 12.9445C21.7257 12.9084 21.7643 12.8573 21.7851 12.7984L22.0339 12.0335C22.1113 11.801 22.2418 11.5897 22.4152 11.4164C22.5886 11.2432 22.8001 11.1127 23.0328 11.0354L23.7982 10.7868C23.8572 10.766 23.9083 10.7275 23.9445 10.6764C23.9806 10.6254 24 10.5644 24 10.5019C24 10.4394 23.9806 10.3784 23.9445 10.3274C23.9083 10.2764 23.8572 10.2378 23.7982 10.217L23.7829 10.2132ZM12 2C12.957 2 13.8826 2.13443 14.7589 2.38542C14.6435 2.45713 14.5197 2.51549 14.39 2.55903L13.05 2.99903C12.7677 3.09976 12.5186 3.27531 12.329 3.50625C12.2199 3.5021 12.1102 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.1949 20.5 19.68 17.4613 20.3742 13.465C20.4642 13.5981 20.5776 13.7148 20.71 13.809C20.9288 13.9654 21.191 14.0495 21.46 14.0495C21.5752 14.0495 21.6892 14.034 21.7991 14.0041C20.871 18.5665 16.8365 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2Z',
    chat_multiple_heart: 'M6.3412 8.3412C7.1326 7.5498 8.41849 7.55366 9.21333 8.3485L9.49671 8.63188L9.77626 8.35179C10.5691 7.55898 11.8556 7.56284 12.6518 8.3591C13.4468 9.15408 13.4493 10.4364 12.6597 11.2303L9.73275 14.1556C9.6107 14.2777 9.41283 14.2777 9.29079 14.1556L6.3485 11.2133C5.55366 10.4185 5.5498 9.1326 6.3412 8.3412ZM2.06158 10.5C2.06158 6.35786 5.41944 3 9.56158 3C13.7037 3 17.0616 6.35786 17.0616 10.5C17.0616 14.6421 13.7037 18 9.56158 18C8.46241 18 7.41678 17.7631 6.47447 17.337C5.44699 17.5819 4.29396 17.8587 3.54374 18.039C2.6294 18.2588 1.80697 17.428 2.03999 16.5147C2.22638 15.7842 2.5102 14.6714 2.76423 13.6734C2.31325 12.7088 2.06158 11.6329 2.06158 10.5ZM9.56158 4.5C6.24787 4.5 3.56158 7.18629 3.56158 10.5C3.56158 11.4914 3.80145 12.4246 4.22568 13.2468L4.35619 13.4998L4.28601 13.7757C4.05784 14.6724 3.79467 15.7047 3.59592 16.4838C4.39489 16.2919 5.46095 16.0363 6.38368 15.8167L6.6482 15.7537L6.89161 15.8749C7.69487 16.2748 8.60084 16.5 9.56158 16.5C12.8753 16.5 15.5616 13.8137 15.5616 10.5C15.5616 7.18629 12.8753 4.5 9.56158 4.5ZM9.46191 18.9995C10.8001 20.241 12.5922 21.0001 14.5616 21.0001C15.6611 21.0001 16.707 20.763 17.6495 20.3367C18.6933 20.581 19.8358 20.8248 20.563 20.9768C21.4554 21.1633 22.2348 20.3623 22.0304 19.4773C21.8679 18.774 21.6117 17.6821 21.3586 16.6741C21.8098 15.7094 22.0616 14.6332 22.0616 13.5001C22.0616 10.2171 19.9523 7.42684 17.015 6.41052C17.3653 7.04756 17.6363 7.73435 17.8146 8.45761C19.4676 9.52617 20.5616 11.3853 20.5616 13.5001C20.5616 14.4915 20.3217 15.4247 19.8975 16.2469L19.767 16.4999L19.8372 16.7757C20.065 17.6711 20.3037 18.6757 20.4787 19.4262C19.7046 19.2625 18.6611 19.0361 17.7395 18.8167L17.475 18.7537L17.2316 18.8749C16.4283 19.2748 15.5223 19.5001 14.5616 19.5001C13.5021 19.5001 12.5067 19.2254 11.6427 18.7434C10.9768 18.911 10.2796 19.0001 9.56163 19.0001C9.52835 19.0001 9.49511 18.9999 9.46191 18.9995Z',
    chat_help: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM12 15.5C12.5523 15.5 13 15.9477 13 16.5C13 17.0523 12.5523 17.5 12 17.5C11.4477 17.5 11 17.0523 11 16.5C11 15.9477 11.4477 15.5 12 15.5ZM12 6.75C13.5188 6.75 14.75 7.98122 14.75 9.5C14.75 10.5108 14.4525 11.074 13.6989 11.8586L13.5303 12.0303C12.9084 12.6522 12.75 12.9163 12.75 13.5C12.75 13.9142 12.4142 14.25 12 14.25C11.5858 14.25 11.25 13.9142 11.25 13.5C11.25 12.4892 11.5475 11.926 12.3011 11.1414L12.4697 10.9697C13.0916 10.3478 13.25 10.0837 13.25 9.5C13.25 8.80964 12.6904 8.25 12 8.25C11.3528 8.25 10.8205 8.74187 10.7565 9.37219L10.75 9.5C10.75 9.91421 10.4142 10.25 10 10.25C9.58579 10.25 9.25 9.91421 9.25 9.5C9.25 7.98122 10.4812 6.75 12 6.75Z',
    chat_empty: 'M5.25 18C3.45507 18 2 16.5449 2 14.75V6.25C2 4.45507 3.45507 3 5.25 3H18.75C20.5449 3 22 4.45507 22 6.25V14.75C22 16.5449 20.5449 18 18.75 18H13.0125L7.99868 21.7507C7.44585 22.1642 6.6625 22.0512 6.24901 21.4984C6.08736 21.2822 6 21.0196 6 20.7499L5.99921 18H5.25ZM12.5135 16.5H18.75C19.7165 16.5 20.5 15.7165 20.5 14.75V6.25C20.5 5.2835 19.7165 4.5 18.75 4.5H5.25C4.2835 4.5 3.5 5.2835 3.5 6.25V14.75C3.5 15.7165 4.2835 16.5 5.25 16.5H7.49879L7.499 17.2498L7.49986 20.2506L12.5135 16.5Z',
    chat_bubbles_question: 'M8.14303 6.30723C8.57707 6.07535 9.04414 6.00076 9.49888 6.00073C10.0253 6.0007 10.6367 6.17363 11.1305 6.57829C11.6475 7.00192 11.9989 7.65186 11.9989 8.5C11.9989 9.47459 11.3102 10.0037 10.9219 10.302C10.8918 10.3252 10.8634 10.347 10.8373 10.3675C10.4127 10.7012 10.2489 10.8795 10.2489 11.25C10.2489 11.6642 9.91314 12 9.49892 12C9.08471 12 8.74892 11.6642 8.74892 11.25C8.74892 10.116 9.46017 9.54195 9.91052 9.18806C10.4238 8.78469 10.4989 8.69484 10.4989 8.5C10.4989 8.10296 10.3503 7.87825 10.1798 7.73853C9.98616 7.57985 9.72254 7.50072 9.49896 7.50073C9.20371 7.50075 9.00078 7.54962 8.84982 7.63027C8.70637 7.7069 8.55459 7.84146 8.40826 8.11137C8.21083 8.47551 7.7556 8.61066 7.39146 8.41324C7.02732 8.21582 6.89217 7.76058 7.08959 7.39644C7.35326 6.91012 7.70147 6.54311 8.14303 6.30723ZM9.49909 15.0001C10.0514 15.0001 10.4992 14.5524 10.4992 14.0001C10.4992 13.4477 10.0514 13 9.49909 13C8.94677 13 8.49902 13.4477 8.49902 14.0001C8.49902 14.5524 8.94677 15.0001 9.49909 15.0001ZM9.49908 3C5.35694 3 1.99908 6.35786 1.99908 10.5C1.99908 11.6329 2.25075 12.7088 2.70173 13.6734C2.4477 14.6714 2.16388 15.7842 1.97749 16.5147C1.74447 17.428 2.5669 18.2588 3.48124 18.039C4.23146 17.8587 5.38449 17.5819 6.41197 17.337C7.35428 17.7631 8.39991 18 9.49908 18C13.6412 18 16.9991 14.6421 16.9991 10.5C16.9991 6.35786 13.6412 3 9.49908 3ZM3.49908 10.5C3.49908 7.18629 6.18537 4.5 9.49908 4.5C12.8128 4.5 15.4991 7.18629 15.4991 10.5C15.4991 13.8137 12.8128 16.5 9.49908 16.5C8.53834 16.5 7.63237 16.2748 6.82911 15.8749L6.5857 15.7537L6.32118 15.8167C5.39845 16.0363 4.33239 16.2919 3.53342 16.4838C3.73217 15.7047 3.99534 14.6724 4.22351 13.7757L4.29369 13.4998L4.16318 13.2468C3.73895 12.4246 3.49908 11.4914 3.49908 10.5ZM14.4991 21.0001C12.5297 21.0001 10.7376 20.241 9.39941 18.9995C9.43261 18.9999 9.46585 19.0001 9.49913 19.0001C10.2171 19.0001 10.9143 18.911 11.5802 18.7434C12.4442 19.2254 13.4396 19.5001 14.4991 19.5001C15.4598 19.5001 16.3658 19.2748 17.1691 18.8749L17.4125 18.7537L17.677 18.8167C18.5986 19.0361 19.6421 19.2625 20.4162 19.4262C20.2412 18.6757 20.0025 17.6711 19.7747 16.7757L19.7045 16.4999L19.835 16.2469C20.2592 15.4247 20.4991 14.4915 20.4991 13.5001C20.4991 11.3853 19.4051 9.52617 17.7521 8.45761C17.5738 7.73435 17.3028 7.04756 16.9525 6.41052C19.8898 7.42684 21.9991 10.2171 21.9991 13.5001C21.9991 14.6332 21.7473 15.7094 21.2961 16.6741C21.5492 17.6821 21.8054 18.774 21.9679 19.4773C22.1723 20.3623 21.3929 21.1633 20.5005 20.9768C19.7733 20.8248 18.6308 20.581 17.587 20.3367C16.6445 20.763 15.5986 21.0001 14.4991 21.0001Z',
    chat: 'M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.12006 20.1281 10.5322 20.5 12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z',
    bot: 'M17.7534 13.9994C18.9961 13.9994 20.0034 15.0068 20.0034 16.2494V17.1545C20.0034 18.2482 19.526 19.2874 18.6961 19.9998C17.1307 21.3437 14.8904 22.0006 12.0004 22.0006C9.11087 22.0006 6.87205 21.344 5.30918 20.0003C4.48056 19.2879 4.00391 18.2495 4.00391 17.1567V16.2494C4.00391 15.0068 5.01127 13.9994 6.25391 13.9994H17.7534ZM17.7534 15.4994H6.25391C5.83969 15.4994 5.50391 15.8352 5.50391 16.2494V17.1567C5.50391 17.8124 5.7899 18.4354 6.28707 18.8629C7.54516 19.9445 9.44117 20.5006 12.0004 20.5006C14.5603 20.5006 16.4582 19.9442 17.7191 18.8617C18.2169 18.4342 18.5034 17.8107 18.5034 17.1545V16.2494C18.5034 15.8352 18.1676 15.4994 17.7534 15.4994ZM11.8989 2.00685L12.0007 2C12.3804 2 12.6942 2.28215 12.7438 2.64823L12.7507 2.75L12.7499 3.499L16.2504 3.49951C17.493 3.49951 18.5004 4.50687 18.5004 5.74951V10.2541C18.5004 11.4967 17.493 12.5041 16.2504 12.5041H7.75036C6.50772 12.5041 5.50036 11.4967 5.50036 10.2541V5.74951C5.50036 4.50687 6.50772 3.49951 7.75036 3.49951L11.2499 3.499L11.2507 2.75C11.2507 2.3703 11.5328 2.05651 11.8989 2.00685L12.0007 2L11.8989 2.00685ZM16.2504 4.99951H7.75036C7.33615 4.99951 7.00036 5.33529 7.00036 5.74951V10.2541C7.00036 10.6683 7.33615 11.0041 7.75036 11.0041H16.2504C16.6646 11.0041 17.0004 10.6683 17.0004 10.2541V5.74951C17.0004 5.33529 16.6646 4.99951 16.2504 4.99951ZM9.74965 6.49951C10.4396 6.49951 10.9989 7.05883 10.9989 7.74879C10.9989 8.43876 10.4396 8.99808 9.74965 8.99808C9.05969 8.99808 8.50036 8.43876 8.50036 7.74879C8.50036 7.05883 9.05969 6.49951 9.74965 6.49951ZM14.2424 6.49951C14.9324 6.49951 15.4917 7.05883 15.4917 7.74879C15.4917 8.43876 14.9324 8.99808 14.2424 8.99808C13.5524 8.99808 12.9931 8.43876 12.9931 7.74879C12.9931 7.05883 13.5524 6.49951 14.2424 6.49951Z',
    bot_sparkle: 'M18.5004 10.2546C18.5004 10.2994 18.4991 10.3438 18.4965 10.3879C18.4546 10.3508 18.4105 10.3159 18.3645 10.2834C18.1037 10.099 17.7921 10 17.4728 10C17.3115 10 17.1522 10.0253 17.0004 10.074V5.74999C17.0004 5.33578 16.6646 4.99999 16.2504 4.99999H7.75036C7.33615 4.99999 7.00036 5.33578 7.00036 5.74999V10.2546C7.00036 10.6688 7.33615 11.0046 7.75036 11.0046H16.0258L16.0166 11.03L16.0125 11.0417L15.5622 12.426L15.5534 12.4524C15.5474 12.4699 15.5411 12.4873 15.5345 12.5046H7.75036C6.50772 12.5046 5.50036 11.4972 5.50036 10.2546V5.74999C5.50036 4.50735 6.50772 3.49999 7.75036 3.49999L11.2499 3.49949L11.2507 2.75049C11.2507 2.37079 11.5328 2.057 11.8989 2.00733L12.0007 2.00049C12.3804 2.00049 12.6942 2.28264 12.7438 2.64872L12.7507 2.75049L12.7499 3.49949L16.2504 3.49999C17.493 3.49999 18.5004 4.50735 18.5004 5.74999V10.2546ZM13.0428 14.0365L13.1554 13.9999H6.25391C5.01127 13.9999 4.00391 15.0073 4.00391 16.2499V17.1572C4.00391 18.25 4.48056 19.2884 5.30918 20.0008C6.87205 21.3445 9.11087 22.0011 12.0004 22.0011C14.0763 22.0011 15.8171 21.6621 17.2132 20.9731C16.9968 20.9321 16.7904 20.8451 16.6087 20.7166C16.3478 20.5322 16.1506 20.2714 16.0442 19.97L16.04 19.9583L16.0096 19.8646C14.9245 20.2865 13.5901 20.5011 12.0004 20.5011C9.44117 20.5011 7.54516 19.945 6.28707 18.8634C5.7899 18.4359 5.50391 17.8129 5.50391 17.1572V16.2499C5.50391 15.8357 5.83969 15.4999 6.25391 15.4999H12.0004L12.0004 15.4966C12.0004 15.1769 12.0996 14.8653 12.2843 14.6045C12.4689 14.3438 12.7299 14.1468 13.0311 14.0406L13.0428 14.0365ZM10.9989 7.74928C10.9989 7.05932 10.4396 6.49999 9.74965 6.49999C9.05969 6.49999 8.50036 7.05932 8.50036 7.74928C8.50036 8.43925 9.05969 8.99857 9.74965 8.99857C10.4396 8.99857 10.9989 8.43925 10.9989 7.74928ZM14.2424 6.49999C14.9324 6.49999 15.4917 7.05932 15.4917 7.74928C15.4917 8.43925 14.9324 8.99857 14.2424 8.99857C13.5524 8.99857 12.9931 8.43925 12.9931 7.74928C12.9931 7.05932 13.5524 6.49999 14.2424 6.49999ZM16.0886 17.4123C16.0163 17.3189 15.9381 17.2298 15.8542 17.1457C15.5421 16.8326 15.161 16.5967 14.7413 16.4568L13.3635 16.0094C13.2573 15.972 13.1654 15.9025 13.1003 15.8107C13.0353 15.7188 13.0004 15.6091 13.0004 15.4966C13.0004 15.384 13.0353 15.2743 13.1003 15.1824C13.1654 15.0906 13.2573 15.0212 13.3635 14.9837L14.7413 14.5363C15.1551 14.3935 15.5302 14.1571 15.8374 13.8454C16.1361 13.5422 16.3626 13.1759 16.5004 12.7737L16.5118 12.7396L16.9596 11.3629C16.997 11.2568 17.0665 11.1649 17.1584 11.0999C17.2504 11.0349 17.3602 11 17.4728 11C17.5854 11 17.6953 11.0349 17.7872 11.0999C17.8791 11.1649 17.9486 11.2568 17.986 11.3629L18.4338 12.7396C18.5731 13.1582 18.8081 13.5385 19.1202 13.8504C19.4323 14.1623 19.813 14.3971 20.2318 14.5363L21.6096 14.9837L21.6372 14.9906C21.7434 15.028 21.8353 15.0975 21.9004 15.1893C21.9654 15.2812 22.0004 15.3909 22.0004 15.5034C22.0004 15.616 21.9654 15.7257 21.9004 15.8176C21.8353 15.9094 21.7434 15.9788 21.6372 16.0163L20.2594 16.4637C19.8405 16.6029 19.4599 16.8377 19.1478 17.1496C18.8356 17.4615 18.6006 17.8418 18.4614 18.2604L18.0136 19.6371C18.0096 19.6486 18.0051 19.6598 18.0004 19.6709C17.9609 19.7627 17.8967 19.8421 17.8147 19.9001C17.7228 19.9651 17.613 20 17.5004 20C17.3878 20 17.2779 19.9651 17.186 19.9001C17.0941 19.8351 17.0246 19.7432 16.9871 19.6371L16.5394 18.2604C16.4382 17.9533 16.2855 17.6666 16.0886 17.4123ZM23.7833 21.2132L23.0179 20.9646C22.7851 20.8873 22.5737 20.7568 22.4003 20.5836C22.2269 20.4103 22.0963 20.199 22.019 19.9665L21.7702 19.2016C21.7494 19.1427 21.7108 19.0916 21.6597 19.0555C21.6086 19.0194 21.5476 19 21.4851 19C21.4225 19 21.3615 19.0194 21.3104 19.0555C21.2593 19.0916 21.2207 19.1427 21.1999 19.2016L20.9512 19.9665C20.8753 20.1974 20.7471 20.4076 20.5765 20.5808C20.4058 20.7539 20.1974 20.8853 19.9676 20.9646L19.2021 21.2132C19.1431 21.234 19.092 21.2725 19.0559 21.3236C19.0198 21.3746 19.0004 21.4356 19.0004 21.4981C19.0004 21.5606 19.0198 21.6216 19.0559 21.6726C19.092 21.7236 19.1431 21.7622 19.2021 21.783L19.9676 22.0316C20.2007 22.1093 20.4124 22.2403 20.5858 22.4143C20.7593 22.5882 20.8896 22.8003 20.9665 23.0335L21.2152 23.7984C21.2361 23.8573 21.2747 23.9084 21.3257 23.9445C21.3768 23.9806 21.4378 24 21.5004 24C21.5629 24 21.6239 23.9806 21.675 23.9445C21.7261 23.9084 21.7647 23.8573 21.7855 23.7984L22.0343 23.0335C22.1116 22.801 22.2422 22.5897 22.4156 22.4164C22.589 22.2432 22.8005 22.1127 23.0332 22.0354L23.7986 21.7868C23.8576 21.766 23.9087 21.7275 23.9448 21.6764C23.981 21.6254 24.0004 21.5644 24.0004 21.5019C24.0004 21.4394 23.981 21.3784 23.9448 21.3274C23.9087 21.2764 23.8576 21.2378 23.7986 21.217L23.7833 21.2132Z',
    close: 'm4.21 4.387.083-.094a1 1 0 0 1 1.32-.083l.094.083L12 10.585l6.293-6.292a1 1 0 1 1 1.414 1.414L13.415 12l6.292 6.293a1 1 0 0 1 .083 1.32l-.083.094a1 1 0 0 1-1.32.083l-.094-.083L12 13.415l-6.293 6.292a1 1 0 0 1-1.414-1.414L10.585 12 4.293 5.707a1 1 0 0 1-.083-1.32l.083-.094-.083.094Z'
  };

  // Font mappings
  var fontFamilies = {
    'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'inter': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'poppins': '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'open-sans': '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  };

  // Default config
  var defaults = {
    headerTitle: 'Support Chat',
    headerSubtitle: "We're here to help",
    fontFamily: 'system',
    useGradient: true,
    gradientStart: '#667eea',
    gradientEnd: '#764ba2',
    primaryColor: '#667eea',
    userBubbleColor: '#667eea',
    userTextColor: '#ffffff',
    agentBubbleColor: '#ffffff',
    agentTextColor: '#2d3748',
    chatBgColor: '#f8fafc',
    badgeColor: '#ff4757',
    launcherIcon: 'chat_multiple',
    enablePrechatForm: true,
    enableCustomAuth: false,
    customAuthName: '',
    customAuthEmail: '',
    welcomeTitle: 'Welcome!',
    welcomeMessage: 'Please fill in your details to start chatting.',
    nameFieldLabel: 'Name *',
    emailFieldLabel: 'Email *',
    startBtnText: 'Start Chat'
  };

  function init() {
    var config = Object.assign({}, defaults, getConfig());
    
    // Validate required D365 settings
    if (!config.orgId || !config.orgUrl || !config.widgetId) {
      console.error('D365 Widget: Missing required config (orgId, orgUrl, widgetId)');
      return;
    }

    var fontFamily = fontFamilies[config.fontFamily] || fontFamilies.system;
    var launcherIcon = iconPaths[config.launcherIcon] || iconPaths.chat_multiple;
    var gradient = config.useGradient ? 
      'linear-gradient(135deg, ' + config.gradientStart + ' 0%, ' + config.gradientEnd + ' 100%)' : 
      config.primaryColor;

    // Inject styles
    injectStyles(config, fontFamily, gradient);
    
    // Inject HTML
    injectHTML(config, launcherIcon, gradient);
    
    // Track widget load
    trackEvent('load');
    
    // Load dependencies then init widget
    loadDependencies(function() {
      initWidget(config);
    });

    window.D365ModernChatWidget.initialized = true;
  }

  function injectStyles(c, fontFamily, gradient) {
    var css = document.createElement('style');
    css.textContent = [
      '[id^="Microsoft_Omnichannel"],[class^="lcw-"]{display:none!important;visibility:hidden!important}',
      '@keyframes d365pulse{0%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 0 rgba(102,126,234,.4)}50%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 12px rgba(102,126,234,0)}100%{box-shadow:0 4px 20px rgba(0,0,0,.3),0 0 0 0 rgba(102,126,234,0)}}',
      '@keyframes d365spin{to{transform:rotate(360deg)}}',
      '@keyframes d365fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
      '@keyframes d365bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}',
      '.d365-launcher{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:999999;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.3);transition:transform .3s,box-shadow .3s;background:'+gradient+';animation:d365pulse 2.5s ease-in-out infinite}',
      '.d365-launcher:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(0,0,0,.4);animation:none}',
      '.d365-launcher.open{animation:none}',
      '.d365-launcher svg{width:28px;height:28px;fill:#fff}',
      '.d365-launcher .chat-icon{display:block}.d365-launcher .close-icon{display:none}',
      '.d365-launcher.open .chat-icon{display:none}.d365-launcher.open .close-icon{display:block}',
      '.d365-badge{position:absolute;top:-4px;right:-4px;background:'+c.badgeColor+';color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);transition:all .2s}',
      '.d365-badge.show{opacity:1;transform:scale(1)}',
      '.d365-container{position:fixed;bottom:100px;right:24px;width:400px;height:700px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,.2);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(20px) scale(.95);transition:all .3s;pointer-events:none;z-index:999998;font-family:'+fontFamily+'}',
      '.d365-container.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}',
      '.d365-header{padding:16px 20px;display:flex;align-items:center;gap:12px;background:'+gradient+'}',
      '.d365-header-avatar{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(255,255,255,.5)}',
      '.d365-header-avatar svg{width:26px;height:26px;fill:#fff}',
      '.d365-header-avatar img{width:100%;height:100%;object-fit:cover}',
      '.d365-header-info{flex:1}',
      '.d365-header-title{color:#fff;font-weight:600;font-size:16px}',
      '.d365-header-status{color:rgba(255,255,255,.8);font-size:12px;margin-top:2px}',
      '.d365-header-actions{display:flex;gap:8px}',
      '.d365-header-btn{background:rgba(255,255,255,.2);border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}',
      '.d365-header-btn:hover{background:rgba(255,255,255,.3)}',
      '.d365-header-btn svg{width:18px;height:18px;fill:#fff}',
      '.d365-header-btn.sound-off svg{opacity:.5}',
      '.d365-header-btn.sound-off::after{content:"";position:absolute;width:2px;height:18px;background:#fff;transform:rotate(45deg);border-radius:1px}',
      '.d365-body{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}',
      '.d365-prechat{padding:24px;display:flex;flex-direction:column;gap:16px;flex:1;justify-content:center}',
      '.d365-prechat.hidden{display:none}',
      '.d365-form-title{font-size:20px;font-weight:600;color:#2d3748;text-align:center}',
      '.d365-form-subtitle{font-size:14px;color:#718096;text-align:center;margin-bottom:16px}',
      '.d365-form-group{display:flex;flex-direction:column;gap:6px}',
      '.d365-form-group label{font-size:13px;font-weight:500;color:#4a5568}',
      '.d365-form-group input,.d365-form-group textarea{padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-family:inherit}',
      '.d365-form-group input:focus,.d365-form-group textarea:focus{outline:none;border-color:'+c.primaryColor+';box-shadow:0 0 0 3px '+c.primaryColor+'22}',
      '.d365-form-group textarea{resize:none;min-height:80px}',
      '.d365-start-btn{color:#fff;border:none;padding:14px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;background:'+gradient+';transition:transform .2s,box-shadow .2s}',
      '.d365-start-btn:hover{transform:translateY(-2px);box-shadow:0 4px 15px rgba(0,0,0,.2)}',
      '.d365-start-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}',
      '.d365-connecting{display:none;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:16px;padding:24px;text-align:center}',
      '.d365-connecting.active{display:flex}',
      '.d365-spinner{width:48px;height:48px;border:3px solid #e2e8f0;border-top-color:'+c.primaryColor+';border-radius:50%;animation:d365spin 1s linear infinite}',
      '.d365-messages{display:none;flex-direction:column;flex:1;overflow-y:auto;padding:16px;gap:12px;background:'+c.chatBgColor+';scroll-behavior:smooth}',
      '.d365-messages.active{display:flex}',
      '.d365-msg-wrap{display:flex;gap:10px;max-width:85%;animation:d365fadeIn .3s ease;align-items:flex-start}',
      '.d365-msg-wrap.user{flex-direction:row-reverse;align-self:flex-end}',
      '.d365-msg-wrap.agent{align-self:flex-start}',
      '.d365-msg-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0;overflow:hidden;margin-top:18px;border:2px solid transparent;box-shadow:0 2px 8px rgba(0,0,0,.15),0 0 12px rgba(102,126,234,.2);transition:transform .2s ease,box-shadow .2s ease}',
      '.d365-msg-avatar:hover{transform:scale(1.05);box-shadow:0 4px 12px rgba(0,0,0,.2),0 0 16px rgba(102,126,234,.35)}',
      '.d365-msg-avatar.agent{background:linear-gradient(135deg,'+c.gradientStart+' 0%,'+c.gradientEnd+' 100%);color:#fff;border-color:rgba(102,126,234,.3);box-shadow:0 2px 8px rgba(0,0,0,.15),0 0 12px rgba(102,126,234,.25)}',
      '.d365-msg-avatar.bot{background:linear-gradient(135deg,#00b4d8 0%,#0077b6 100%);color:#fff;border-color:rgba(0,180,216,.3);box-shadow:0 2px 8px rgba(0,0,0,.15),0 0 12px rgba(0,180,216,.25)}',
      '.d365-msg-avatar.user{background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);color:#fff;border-color:rgba(17,153,142,.3);box-shadow:0 2px 8px rgba(0,0,0,.15),0 0 12px rgba(17,153,142,.25)}',
      '.d365-msg-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}',
      '.d365-msg-content{display:flex;flex-direction:column;gap:4px;min-width:0}',
      '.d365-msg-sender{font-size:12px;font-weight:600;color:#64748b;padding:0 4px}',
      '.d365-msg-wrap.user .d365-msg-sender{text-align:right}',
      '.d365-msg{padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap}',
      '.d365-msg.agent{background:'+c.agentBubbleColor+';color:'+c.agentTextColor+';border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.08)}',
      '.d365-msg.user{background:'+c.userBubbleColor+';color:'+c.userTextColor+';border-bottom-right-radius:4px}',
      '.d365-msg-time{font-size:10px;color:#94a3b8;padding:0 4px}',
      '.d365-msg-wrap.user .d365-msg-time{text-align:right}',
      '.d365-adaptive-card{background:#fff!important;padding:0!important;overflow:hidden;border-radius:12px}',
      '.d365-adaptive-card .ac-pushButton{padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;transition:all .25s ease;border:none;display:block;width:100%;margin-top:8px;background:'+gradient+';color:#fff;box-shadow:0 2px 4px rgba(102,126,234,.2)}',
      '.d365-adaptive-card .ac-pushButton:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 6px 20px rgba(102,126,234,.4),0 0 15px rgba(102,126,234,.2);background:linear-gradient(135deg,'+c.gradientEnd+' 0%,'+c.gradientStart+' 100%)}',
      '.d365-adaptive-card .ac-pushButton:active{transform:translateY(0) scale(.98);box-shadow:0 2px 8px rgba(102,126,234,.3)}',
      '.d365-adaptive-card .ac-actionSet{display:flex!important;flex-direction:column!important;gap:8px!important}',
      '.d365-hero-card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);max-width:280px}',
      '.d365-hero-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.15)}',
      '.d365-hero-card img{width:100%;height:160px;object-fit:cover;background:#f0f4f8}',
      '.d365-hero-card-body{padding:12px}',
      '.d365-hero-card-title{font-size:14px;font-weight:600;color:#1a202c;margin-bottom:4px;line-height:1.3}',
      '.d365-hero-card-subtitle{font-size:12px;color:#64748b;margin-bottom:8px;line-height:1.4}',
      '.d365-hero-card-text{font-size:13px;color:#4a5568;margin-bottom:8px;line-height:1.4}',
      '.d365-hero-card-buttons{display:flex;flex-direction:column;gap:6px}',
      '.d365-hero-card-btn{padding:10px 12px;background:'+gradient+';color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;text-align:center;transition:all .25s ease;box-shadow:0 2px 4px rgba(102,126,234,.2)}',
      '.d365-hero-card-btn:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 6px 16px rgba(102,126,234,.4),0 0 12px rgba(102,126,234,.2);background:linear-gradient(135deg,'+c.gradientEnd+' 0%,'+c.gradientStart+' 100%)}',
      '.d365-hero-card-btn:active{transform:translateY(0) scale(.98);box-shadow:0 2px 6px rgba(102,126,234,.3)}',
      '.d365-hero-card-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.d365-hero-carousel-wrap{position:relative;width:100%}',
      '.d365-hero-carousel{display:flex;gap:12px;overflow-x:auto;padding:8px 4px;scroll-snap-type:x mandatory;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}',
      '.d365-hero-carousel::-webkit-scrollbar{display:none}',
      '.d365-hero-carousel .d365-hero-card{flex:0 0 auto;scroll-snap-align:start;min-width:220px;max-width:240px}',
      '.d365-carousel-btn{position:absolute;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:50%;background:#fff;border:none;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:all .2s;opacity:.9}',
      '.d365-carousel-btn:hover{background:#f8f9fa;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:1}',
      '.d365-carousel-btn.prev{left:-6px}',
      '.d365-carousel-btn.next{right:-6px}',
      '.d365-carousel-btn svg{width:14px;height:14px;fill:#4a5568}',
      '.d365-suggested-actions{display:flex;flex-direction:column;gap:8px;margin-top:12px}',
      '.d365-suggested-btn{padding:10px 16px;background:'+gradient+';color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;transition:all .25s ease;font-weight:500;text-align:center;box-shadow:0 2px 4px rgba(102,126,234,.2)}',
      '.d365-suggested-btn:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 6px 16px rgba(102,126,234,.4),0 0 12px rgba(102,126,234,.2);background:linear-gradient(135deg,'+c.gradientEnd+' 0%,'+c.gradientStart+' 100%)}',
      '.d365-suggested-btn:active{transform:translateY(0) scale(.98);box-shadow:0 2px 6px rgba(102,126,234,.3)}',
      '.d365-suggested-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}',
      '.d365-typing{display:none;padding:8px 0;align-items:center;gap:8px}',
      '.d365-typing.active{display:flex}',
      '.d365-typing-dots{display:flex;gap:4px;padding:12px 16px;background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-left:46px}',
      '.d365-typing-dots span{width:8px;height:8px;background:#a0aec0;border-radius:50%;animation:d365bounce 1.4s infinite ease-in-out}',
      '.d365-typing-dots span:nth-child(1){animation-delay:-.32s}',
      '.d365-typing-dots span:nth-child(2){animation-delay:-.16s}',
      '.d365-input-area{display:none;background:#fff;border-top:1px solid #e2e8f0;flex-direction:column;gap:10px;padding:12px 16px 16px}',
      '.d365-input-area.active{display:flex}',
      '.d365-input-wrap{display:flex;flex-direction:column;gap:10px}',
      '.d365-input{width:100%;min-height:60px;max-height:120px;padding:12px 14px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;resize:none;font-family:inherit;line-height:1.4;overflow-y:auto;background:#fff}',
      '.d365-input:focus{outline:none;border-color:'+c.primaryColor+';box-shadow:0 0 0 3px '+c.primaryColor+'1a}',
      '.d365-input::placeholder{color:#a0aec0}',
      '.d365-input-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px}',
      '.d365-input-actions{display:flex;gap:8px}',
      '.d365-action-btn{width:36px;height:36px;border:none;background:transparent;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748b;transition:all .2s}',
      '.d365-action-btn:hover{background:#f1f5f9;color:'+c.primaryColor+'}',
      '.d365-action-btn:hover svg{fill:'+c.primaryColor+'}',
      '.d365-action-btn svg{width:20px;height:20px;fill:currentColor}',
      '.d365-action-btn.recording{background:#fee2e2;color:#ef4444}',
      '.d365-action-btn.recording svg{fill:#ef4444;animation:d365pulseMic 1s infinite}',
      '@keyframes d365pulseMic{0%,100%{opacity:1}50%{opacity:.5}}',
      '.d365-voice-recording{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#ef4444;color:#fff;padding:10px 20px;border-radius:24px;display:none;align-items:center;gap:10px;font-size:14px;font-weight:500;box-shadow:0 4px 15px rgba(239,68,68,.4);z-index:100}',
      '.d365-voice-recording.show{display:flex;animation:d365slideDown .3s ease}',
      '@keyframes d365slideDown{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}',
      '.d365-voice-dot{width:10px;height:10px;background:#fff;border-radius:50%;animation:d365pulseDot 1s infinite}',
      '@keyframes d365pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}',
      '.d365-voice-wave{display:flex;gap:2px;align-items:center}',
      '.d365-voice-wave span{width:3px;background:#fff;border-radius:2px;animation:d365wave .6s infinite ease-in-out}',
      '.d365-voice-wave span:nth-child(1){height:8px;animation-delay:0s}',
      '.d365-voice-wave span:nth-child(2){height:16px;animation-delay:.1s}',
      '.d365-voice-wave span:nth-child(3){height:12px;animation-delay:.2s}',
      '.d365-voice-wave span:nth-child(4){height:20px;animation-delay:.3s}',
      '.d365-voice-wave span:nth-child(5){height:12px;animation-delay:.4s}',
      '@keyframes d365wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.5)}}',
      '.d365-stop-voice{background:rgba(255,255,255,.2);border:none;padding:6px 12px;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;font-weight:500;transition:background .2s}',
      '.d365-stop-voice:hover{background:rgba(255,255,255,.3)}',
      '.d365-send-btn{width:40px;height:40px;border-radius:10px;background:transparent;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:'+c.primaryColor+'}',
      '.d365-send-btn:hover{background:'+c.primaryColor+'1a}',
      '.d365-send-btn:active{transform:scale(.95)}',
      '.d365-send-btn svg{width:22px;height:22px;fill:currentColor}',
      '.d365-ended{display:none;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:16px;padding:24px;text-align:center}',
      '.d365-ended.active{display:flex}',
      '.d365-new-btn{color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-top:8px;background:'+gradient+'}',
      '.d365-confirm{position:absolute;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:200}',
      '.d365-confirm.show{display:flex}',
      '.d365-confirm-box{background:#fff;padding:24px;border-radius:16px;text-align:center;max-width:280px;margin:20px}',
      '.d365-confirm-title{font-size:16px;font-weight:600;color:#2d3748;margin-bottom:8px}',
      '.d365-confirm-text{font-size:14px;color:#64748b;margin-bottom:20px}',
      '.d365-confirm-btns{display:flex;gap:12px;justify-content:center}',
      '.d365-confirm-btn{padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;border:none}',
      '.d365-confirm-btn.cancel{background:#e2e8f0;color:#4a5568}',
      '.d365-confirm-btn.end{background:#ef4444;color:#fff}',
      '.d365-system-msg{text-align:center;padding:8px 16px;color:#64748b;font-size:12px;background:#e2e8f0;border-radius:12px;margin:8px auto;max-width:fit-content}',
      // Voice/Video Call styles
      '.d365-incoming-call{display:none;background:linear-gradient(135deg,'+c.gradientStart+' 0%,'+c.gradientEnd+' 100%);padding:16px;border-radius:12px;margin:12px;animation:d365fadeIn .3s ease}',
      '.d365-incoming-call.show{display:block}',
      '.d365-incoming-call-header{display:flex;align-items:center;gap:12px;margin-bottom:12px}',
      '.d365-incoming-call-icon{width:44px;height:44px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center}',
      '.d365-incoming-call-icon svg{width:24px;height:24px;fill:#fff}',
      '.d365-incoming-call-info{flex:1}',
      '.d365-incoming-call-title{color:#fff;font-weight:600;font-size:15px}',
      '.d365-incoming-call-subtitle{color:rgba(255,255,255,.8);font-size:13px}',
      '.d365-incoming-call-actions{display:flex;gap:8px;justify-content:center}',
      '.d365-call-btn-accept{background:#22c55e;color:#fff;border:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}',
      '.d365-call-btn-accept:hover{background:#16a34a;transform:scale(1.05)}',
      '.d365-call-btn-accept svg{width:16px;height:16px;fill:#fff}',
      '.d365-call-btn-decline{background:#ef4444;color:#fff;border:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}',
      '.d365-call-btn-decline:hover{background:#dc2626;transform:scale(1.05)}',
      '.d365-call-btn-decline svg{width:16px;height:16px;fill:#fff}',
      '.d365-call-container{display:none;flex-direction:column;background:#1a1a2e;border-radius:12px;margin:12px;overflow:hidden}',
      '.d365-call-container.active{display:flex}',
      '.d365-call-header{padding:12px 16px;display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,.2)}',
      '.d365-call-status{color:#fff;font-size:14px;font-weight:500}',
      '.d365-call-duration{color:rgba(255,255,255,.7);font-size:13px}',
      '.d365-call-video-area{position:relative;min-height:200px;background:#0d0d1a;display:flex;align-items:center;justify-content:center}',
      '.d365-call-connecting{display:flex;flex-direction:column;align-items:center;gap:12px;color:rgba(255,255,255,.8);font-size:14px}',
      '.d365-call-avatar{width:80px;height:80px;background:linear-gradient(135deg,'+c.gradientStart+' 0%,'+c.gradientEnd+' 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:600}',
      '.d365-remote-video,.d365-local-video{width:100%;height:100%;object-fit:cover}',
      '.d365-local-video{position:absolute;bottom:12px;right:12px;width:100px;height:75px;border-radius:8px;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.3)}',
      '.d365-call-controls{padding:16px;display:flex;justify-content:center;gap:12px;background:rgba(0,0,0,.2)}',
      '.d365-call-ctrl-btn{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;background:rgba(255,255,255,.1)}',
      '.d365-call-ctrl-btn:hover{background:rgba(255,255,255,.2)}',
      '.d365-call-ctrl-btn svg{width:22px;height:22px;fill:#fff}',
      '.d365-call-ctrl-btn.muted{background:#ef4444}',
      '.d365-call-ctrl-btn.end-call{background:#ef4444}',
      '.d365-call-ctrl-btn.end-call:hover{background:#dc2626}',
      '@media(max-width:480px){.d365-container{width:100%;height:100%;max-height:100%;bottom:0;right:0;border-radius:0}.d365-launcher{bottom:16px;right:16px}}'
    ].join('');
    document.head.appendChild(css);
  }

  function injectHTML(c, launcherIcon, gradient) {
    var html = [
      '<button class="d365-launcher" id="d365Launcher">',
        '<span class="d365-badge" id="d365Badge">0</span>',
        '<svg class="chat-icon" viewBox="0 0 24 24"><path d="'+launcherIcon+'"/></svg>',
        '<svg class="close-icon" viewBox="0 0 24 24"><path d="'+iconPaths.close+'"/></svg>',
      '</button>',
      '<div class="d365-container" id="d365Container">',
        '<div class="d365-header">',
          '<div class="d365-header-avatar">'+(c.headerLogo?'<img src="'+c.headerLogo+'" alt="">':'<svg viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12z"/></svg>')+'</div>',
          '<div class="d365-header-info">',
            '<div class="d365-header-title">'+c.headerTitle+'</div>',
            '<div class="d365-header-status">'+c.headerSubtitle+'</div>',
          '</div>',
          '<div class="d365-header-actions">',
            '<button class="d365-header-btn" id="d365Sound" title="Sound notifications on"><svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg></button>',
            '<button class="d365-header-btn" id="d365Minimize" title="Minimize"><svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg></button>',
            '<button class="d365-header-btn" id="d365Close" title="Close"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>',
          '</div>',
        '</div>',
        '<div class="d365-body">',
          // Incoming Call Notification
          '<div class="d365-incoming-call" id="d365IncomingCall">',
            '<div class="d365-incoming-call-header">',
              '<div class="d365-incoming-call-icon"><svg viewBox="0 0 24 24"><path fill="white" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg></div>',
              '<div class="d365-incoming-call-info">',
                '<div class="d365-incoming-call-title" id="d365CallTitle">Incoming Call</div>',
                '<div class="d365-incoming-call-subtitle" id="d365CallSubtitle">Agent is calling...</div>',
              '</div>',
            '</div>',
            '<div class="d365-incoming-call-actions">',
              '<button class="d365-call-btn-accept" id="d365AcceptVideo" title="Accept with video"><svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>Video</button>',
              '<button class="d365-call-btn-accept" id="d365AcceptVoice" title="Accept voice only"><svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>Voice</button>',
              '<button class="d365-call-btn-decline" id="d365DeclineCall" title="Decline"><svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>Decline</button>',
            '</div>',
          '</div>',
          // Active Call Container
          '<div class="d365-call-container" id="d365CallContainer">',
            '<div class="d365-call-header">',
              '<div class="d365-call-status" id="d365CallStatus">Connecting...</div>',
              '<div class="d365-call-duration" id="d365CallDuration">00:00</div>',
            '</div>',
            '<div class="d365-call-video-area" id="d365CallVideoArea">',
              '<div class="d365-call-connecting" id="d365CallConnecting"><div class="d365-spinner"></div><div>Connecting to agent...</div></div>',
              '<div class="d365-call-avatar" id="d365CallAvatar" style="display:none">A</div>',
              '<video id="d365RemoteVideo" class="d365-remote-video" autoplay playsinline style="display:none"></video>',
              '<video id="d365LocalVideo" class="d365-local-video" autoplay playsinline muted style="display:none"></video>',
            '</div>',
            '<div class="d365-call-controls">',
              '<button class="d365-call-ctrl-btn" id="d365MuteMic" title="Mute"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>',
              '<button class="d365-call-ctrl-btn" id="d365ToggleCamera" title="Camera" style="display:none"><svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg></button>',
              '<button class="d365-call-ctrl-btn end-call" id="d365EndCall" title="End call"><svg viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg></button>',
            '</div>',
          '</div>',
          '<form class="d365-prechat" id="d365Prechat">',
            '<div class="d365-form-title">'+c.welcomeTitle+'</div>',
            '<div class="d365-form-subtitle">'+c.welcomeMessage+'</div>',
            '<div class="d365-form-group"><label>'+c.nameFieldLabel+'</label><input type="text" id="d365Name" required></div>',
            '<div class="d365-form-group"><label>'+c.emailFieldLabel+'</label><input type="email" id="d365Email" required></div>',
            '<div class="d365-form-group"><label>'+(c.questionFieldLabel||'How can we help?')+'</label><textarea id="d365Question"></textarea></div>',
            '<button type="button" class="d365-start-btn" id="d365StartBtn">'+c.startBtnText+'</button>',
          '</form>',
          '<div class="d365-connecting" id="d365Connecting">',
            '<div class="d365-spinner"></div>',
            '<div style="color:#4a5568;font-size:14px">Connecting you with an agent...</div>',
          '</div>',
          '<div class="d365-messages" id="d365Messages">',
            '<div class="d365-typing" id="d365Typing"><div class="d365-typing-dots"><span></span><span></span><span></span></div></div>',
          '</div>',
          '<div class="d365-input-area" id="d365InputArea">',
            '<div class="d365-voice-recording" id="d365VoiceRec">',
              '<div class="d365-voice-dot"></div>',
              '<div class="d365-voice-wave"><span></span><span></span><span></span><span></span><span></span></div>',
              '<span>Recording...</span>',
              '<button class="d365-stop-voice" id="d365StopVoice">Stop</button>',
            '</div>',
            '<div class="d365-input-wrap">',
              '<textarea class="d365-input" id="d365Input" placeholder="Type your message..." rows="3"></textarea>',
              '<div class="d365-input-row">',
                '<div class="d365-input-actions">',
                  '<input type="file" id="d365File" style="display:none">',
                  '<button type="button" class="d365-action-btn" id="d365AttachBtn" title="Attach"><svg viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/></svg></button>',
                  '<button type="button" class="d365-action-btn" id="d365EmojiBtn" title="Emoji"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg></button>',
                  '<button type="button" class="d365-action-btn" id="d365VoiceBtn" title="Voice input"><svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg></button>',
                '</div>',
                '<button type="button" class="d365-send-btn" id="d365SendBtn" title="Send"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>',
              '</div>',
            '</div>',
          '</div>',
          '<div class="d365-ended" id="d365Ended">',
            '<div style="font-size:48px">👋</div>',
            '<div style="font-size:18px;font-weight:600;color:#2d3748">Chat Ended</div>',
            '<div style="font-size:14px;color:#718096">Thank you for chatting!</div>',
            '<button class="d365-new-btn" id="d365NewBtn">Start New Chat</button>',
          '</div>',
        '</div>',
        '<div class="d365-confirm" id="d365Confirm">',
          '<div class="d365-confirm-box">',
            '<div class="d365-confirm-title">End Chat?</div>',
            '<div class="d365-confirm-text">Are you sure you want to end this conversation?</div>',
            '<div class="d365-confirm-btns">',
              '<button class="d365-confirm-btn cancel" id="d365ConfirmNo">Cancel</button>',
              '<button class="d365-confirm-btn end" id="d365ConfirmYes">End Chat</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    var container = document.createElement('div');
    container.id = 'd365WidgetRoot';
    container.innerHTML = html;
    document.body.appendChild(container);
  }

  function loadDependencies(callback) {
    var loaded = 0;
    var total = 2;

    function checkDone() {
      loaded++;
      if (loaded >= total) callback();
    }

    // Load Adaptive Cards - use multiple sources with fallback
    var acSources = [
      'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/adaptivecards.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/adaptivecards/3.0.2/adaptivecards.min.js',
      'https://unpkg.com/adaptivecards@3.0.2/dist/adaptivecards.min.js'
    ];
    var acIndex = 0;

    function loadAC() {
      if (acIndex >= acSources.length) {
        console.warn('D365 Widget: AdaptiveCards failed to load from all sources');
        checkDone();
        return;
      }
      var script = document.createElement('script');
      script.src = acSources[acIndex];
      script.onload = function() {
        console.log('D365 Widget: AdaptiveCards loaded from', acSources[acIndex]);
        checkDone();
      };
      script.onerror = function() {
        console.warn('D365 Widget: AdaptiveCards failed from', acSources[acIndex]);
        acIndex++;
        loadAC();
      };
      document.head.appendChild(script);
    }
    loadAC();

    // Load Chat SDK
    var sdkSources = [
      'https://moliveirapinto.github.io/d365-modern-chat-widget/dist/chat-sdk-bundle.js',
      'https://raw.githubusercontent.com/moliveirapinto/d365-modern-chat-widget/main/dist/chat-sdk-bundle.js'
    ];
    var sdkIndex = 0;

    function loadSDK() {
      if (sdkIndex >= sdkSources.length) {
        console.error('D365 Widget: Failed to load Chat SDK');
        checkDone();
        return;
      }
      var script = document.createElement('script');
      script.src = sdkSources[sdkIndex];
      script.onload = function() {
        console.log('D365 Widget: SDK loaded from', sdkSources[sdkIndex]);
        checkDone();
      };
      script.onerror = function() {
        sdkIndex++;
        loadSDK();
      };
      document.head.appendChild(script);
    }
    loadSDK();
  }

  function initWidget(config) {
    var chatSDK = null, chatStarted = false, userName = '', userEmail = '';
    var processedMsgs = {};
    var unreadCount = 0;
    
    // Voice/Video calling state
    var VoiceVideoCallingSDK = null;
    var isInCall = false;
    var isMuted = false;
    var isCameraOff = false;
    var callDurationTimer = null;
    var callStartTime = null;
    var pendingCallData = null;
    var currentAgentName = 'Agent';

    // DOM refs
    var $ = function(id) { return document.getElementById(id); };
    var launcher = $('d365Launcher');
    var container = $('d365Container');
    var badge = $('d365Badge');
    var prechat = $('d365Prechat');
    var connecting = $('d365Connecting');
    var messages = $('d365Messages');
    var inputArea = $('d365InputArea');
    var typing = $('d365Typing');
    var input = $('d365Input');
    var ended = $('d365Ended');
    var confirm = $('d365Confirm');
    var soundBtn = $('d365Sound');
    
    // Call UI refs
    var incomingCall = $('d365IncomingCall');
    var callContainer = $('d365CallContainer');
    var callStatus = $('d365CallStatus');
    var callDuration = $('d365CallDuration');
    var callConnecting = $('d365CallConnecting');
    var callAvatar = $('d365CallAvatar');
    var remoteVideo = $('d365RemoteVideo');
    var localVideo = $('d365LocalVideo');

    // Sound notification setup
    var soundEnabled = localStorage.getItem('d365SoundEnabled') !== 'false';
    var notificationAudio = new Audio('https://moliveirapinto.github.io/d365-modern-chat-widget/notification/new-notification-3-398649.mp3');
    notificationAudio.volume = 0.5;

    // Initialize sound button state
    if (!soundEnabled && soundBtn) {
      soundBtn.classList.add('sound-off');
      soundBtn.title = 'Sound notifications off';
    }

    // Sound toggle handler
    if (soundBtn) {
      soundBtn.onclick = function() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('d365SoundEnabled', soundEnabled);
        if (soundEnabled) {
          soundBtn.classList.remove('sound-off');
          soundBtn.title = 'Sound notifications on';
        } else {
          soundBtn.classList.add('sound-off');
          soundBtn.title = 'Sound notifications off';
        }
      };
    }

    function playNotificationSound() {
      if (!soundEnabled) return;
      try {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(function(e) {
          console.log('Could not play notification sound:', e);
        });
      } catch(e) {
        console.log('Could not play notification sound:', e);
      }
    }

    // ============ VOICE/VIDEO CALLING FUNCTIONS ============
    
    async function preloadVoiceVideoCallingSDK(sdk) {
      console.log('📞 Pre-loading VoiceVideoCallingSDK...');
      try {
        if (!sdk.getVoiceVideoCalling) {
          console.log('⚠️ getVoiceVideoCalling not available on SDK');
          return;
        }
        VoiceVideoCallingSDK = await sdk.getVoiceVideoCalling();
        console.log('📞 VoiceVideoCallingSDK pre-loaded:', VoiceVideoCallingSDK ? 'Yes' : 'No');
      } catch (err) {
        console.log('⚠️ VoiceVideoCalling pre-load error:', err.message);
      }
    }
    
    async function initializeVoiceVideoCallingSDK(sdk) {
      console.log('📞 Initializing VoiceVideoCallingSDK...');
      if (!VoiceVideoCallingSDK) {
        console.log('⚠️ VoiceVideoCallingSDK was not pre-loaded');
        return;
      }
      
      try {
        var chatToken = await sdk.getChatToken();
        console.log('📞 Chat token obtained:', chatToken ? 'Yes' : 'No');
        if (!chatToken) {
          console.error('❌ Failed to get chat token for VoiceVideoCalling');
          return;
        }
        
        await VoiceVideoCallingSDK.initialize({
          chatToken: chatToken,
          selfVideoHTMLElementId: 'd365LocalVideo',
          remoteVideoHTMLElementId: 'd365RemoteVideo',
          OCClient: sdk.OCClient
        });
        console.log('✅ VoiceVideoCallingSDK initialized successfully');
        
        // Set up incoming call listener
        VoiceVideoCallingSDK.onCallAdded(function(callInfo) {
          console.log('📞 INCOMING CALL DETECTED!', callInfo);
          var hasVideo = false;
          if (callInfo) {
            hasVideo = callInfo.isVideoCall || callInfo.hasVideo || callInfo.videoEnabled || 
                       callInfo.isVideo || callInfo.callType === 'video' || callInfo.type === 'video' ||
                       callInfo.mediaType === 'video' || callInfo.withVideo || false;
          }
          showIncomingCallNotification({ isVideo: hasVideo, agentName: currentAgentName });
        });
        
        // Set up call disconnected listener
        VoiceVideoCallingSDK.onCallDisconnected(function() {
          console.log('📞 Call disconnected');
          if (incomingCall) incomingCall.classList.remove('show');
          pendingCallData = null;
          if (isInCall) endCall();
        });
        
        if (VoiceVideoCallingSDK.onCallRemoved) {
          VoiceVideoCallingSDK.onCallRemoved(function() {
            console.log('📞 Call removed (agent cancelled)');
            if (incomingCall) incomingCall.classList.remove('show');
            pendingCallData = null;
            if (isInCall) endCall();
          });
        }
        
        console.log('📞 Voice/Video call listeners registered');
      } catch (err) {
        console.error('❌ VoiceVideoCallingSDK init error:', err);
      }
    }
    
    function showIncomingCallNotification(data) {
      console.log('📞 Showing incoming call notification:', data);
      pendingCallData = data;
      if ($('d365CallTitle')) $('d365CallTitle').textContent = data.isVideo ? 'Incoming Video Call' : 'Incoming Voice Call';
      if ($('d365CallSubtitle')) $('d365CallSubtitle').textContent = (data.agentName || 'Agent') + ' is calling...';
      if (incomingCall) incomingCall.classList.add('show');
      playNotificationSound();
      
      // Open widget if minimized
      if (!container.classList.contains('open')) {
        container.classList.add('open');
        launcher.classList.add('open');
      }
    }
    
    async function acceptCall(withVideo) {
      console.log('📞 Accepting call, withVideo:', withVideo);
      
      // Track call initiated
      trackEvent('call');
      
      if (incomingCall) incomingCall.classList.remove('show');
      if (callContainer) callContainer.classList.add('active');
      if (callConnecting) callConnecting.style.display = 'flex';
      if (callAvatar) callAvatar.style.display = 'none';
      if (callStatus) callStatus.textContent = 'Connecting...';
      
      try {
        if (VoiceVideoCallingSDK && VoiceVideoCallingSDK.acceptCall) {
          await VoiceVideoCallingSDK.acceptCall({ withVideo: withVideo });
          console.log('✅ Call accepted');
        }
        
        isInCall = true;
        if (callConnecting) callConnecting.style.display = 'none';
        
        if (withVideo) {
          if ($('d365ToggleCamera')) $('d365ToggleCamera').style.display = 'flex';
          if (localVideo) localVideo.style.display = 'block';
          if (remoteVideo) remoteVideo.style.display = 'block';
          if (callStatus) callStatus.textContent = 'Video Call';
        } else {
          if (callAvatar) {
            callAvatar.textContent = getInitials(currentAgentName);
            callAvatar.style.display = 'flex';
          }
          if (callStatus) callStatus.textContent = 'Voice Call';
        }
        
        // Start duration timer
        callStartTime = Date.now();
        callDurationTimer = setInterval(updateCallDuration, 1000);
        
        // Add call message to chat
        addMessage('📞 ' + (withVideo ? 'Video' : 'Voice') + ' call connected', false, 'System');
      } catch (err) {
        console.error('❌ Error accepting call:', err);
        endCall();
      }
    }
    
    async function declineCall() {
      console.log('📞 Declining call');
      if (incomingCall) incomingCall.classList.remove('show');
      pendingCallData = null;
      
      try {
        if (VoiceVideoCallingSDK && VoiceVideoCallingSDK.rejectCall) {
          await VoiceVideoCallingSDK.rejectCall();
        }
        addMessage('📞 Call declined', false, 'System');
      } catch (err) {
        console.error('❌ Error declining call:', err);
      }
    }
    
    async function endCall() {
      console.log('📞 Ending call');
      isInCall = false;
      
      if (callDurationTimer) {
        clearInterval(callDurationTimer);
        callDurationTimer = null;
      }
      
      if (callContainer) callContainer.classList.remove('active');
      if (localVideo) localVideo.style.display = 'none';
      if (remoteVideo) remoteVideo.style.display = 'none';
      if ($('d365ToggleCamera')) $('d365ToggleCamera').style.display = 'none';
      
      // Reset mute/camera state
      isMuted = false;
      isCameraOff = false;
      if ($('d365MuteMic')) $('d365MuteMic').classList.remove('muted');
      if ($('d365ToggleCamera')) $('d365ToggleCamera').classList.remove('muted');
      
      try {
        if (VoiceVideoCallingSDK && VoiceVideoCallingSDK.stopCall) {
          await VoiceVideoCallingSDK.stopCall();
        }
      } catch (err) {
        console.log('Call end error:', err);
      }
      
      addMessage('📞 Call ended', false, 'System');
    }
    
    function updateCallDuration() {
      if (!callStartTime || !callDuration) return;
      var elapsed = Math.floor((Date.now() - callStartTime) / 1000);
      var mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      var secs = (elapsed % 60).toString().padStart(2, '0');
      callDuration.textContent = mins + ':' + secs;
    }
    
    async function toggleMute() {
      if (!VoiceVideoCallingSDK) return;
      try {
        if (isMuted) {
          await VoiceVideoCallingSDK.unmute();
          isMuted = false;
          if ($('d365MuteMic')) $('d365MuteMic').classList.remove('muted');
        } else {
          await VoiceVideoCallingSDK.mute();
          isMuted = true;
          if ($('d365MuteMic')) $('d365MuteMic').classList.add('muted');
        }
      } catch (err) {
        console.error('Mute toggle error:', err);
      }
    }
    
    async function toggleCamera() {
      if (!VoiceVideoCallingSDK) return;
      try {
        if (isCameraOff) {
          await VoiceVideoCallingSDK.startLocalVideo();
          isCameraOff = false;
          if ($('d365ToggleCamera')) $('d365ToggleCamera').classList.remove('muted');
          if (localVideo) localVideo.style.display = 'block';
        } else {
          await VoiceVideoCallingSDK.stopLocalVideo();
          isCameraOff = true;
          if ($('d365ToggleCamera')) $('d365ToggleCamera').classList.add('muted');
          if (localVideo) localVideo.style.display = 'none';
        }
      } catch (err) {
        console.error('Camera toggle error:', err);
      }
    }
    
    // Call button event listeners
    if ($('d365AcceptVideo')) $('d365AcceptVideo').onclick = function() { acceptCall(true); };
    if ($('d365AcceptVoice')) $('d365AcceptVoice').onclick = function() { acceptCall(false); };
    if ($('d365DeclineCall')) $('d365DeclineCall').onclick = declineCall;
    if ($('d365EndCall')) $('d365EndCall').onclick = endCall;
    if ($('d365MuteMic')) $('d365MuteMic').onclick = toggleMute;
    if ($('d365ToggleCamera')) $('d365ToggleCamera').onclick = toggleCamera;

    function showView(v) {
      prechat.classList.add('hidden');
      connecting.classList.remove('active');
      messages.classList.remove('active');
      inputArea.classList.remove('active');
      ended.classList.remove('active');
      if (v === 'prechat') prechat.classList.remove('hidden');
      else if (v === 'connecting') connecting.classList.add('active');
      else if (v === 'chat') { messages.classList.add('active'); inputArea.classList.add('active'); }
      else if (v === 'ended') { ended.classList.add('active'); chatStarted = false; }
    }

    function getInitials(name) {
      if (!name) return '?';
      var p = name.trim().split(' ');
      return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
    }

    function formatTime(d) {
      return new Date(d).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    }

    function isBot(name) {
      if (!name) return false;
      var n = name.toLowerCase();
      return n.includes('bot') || n.includes('copilot') || n.includes('virtual') || 
             n.includes('assistant') || n.includes('ai') || n === 'cps';
    }

    function isBotRole(role) {
      return role === 'bot' || role === 'Bot' || role === 2;
    }

    function addMessage(text, isUser, senderName, isBotMsg) {
      var wrap = document.createElement('div');
      wrap.className = 'd365-msg-wrap ' + (isUser ? 'user' : 'agent');

      var avatar = document.createElement('div');
      var isBotAvatar = isBotMsg || isBot(senderName);
      var avatarType = isUser ? 'user' : (isBotAvatar ? 'bot' : 'agent');
      avatar.className = 'd365-msg-avatar ' + avatarType;

      if (isUser && config.customerAvatar) avatar.innerHTML = '<img src="'+config.customerAvatar+'">';
      else if (!isUser && isBotAvatar && config.botAvatar) avatar.innerHTML = '<img src="'+config.botAvatar+'">';
      else if (!isUser && !isBotAvatar && config.agentAvatar) avatar.innerHTML = '<img src="'+config.agentAvatar+'">';
      else avatar.textContent = getInitials(isUser ? userName : senderName);

      var content = document.createElement('div');
      content.className = 'd365-msg-content';
      content.innerHTML = '<div class="d365-msg-sender">'+(isUser?userName:(senderName||'Agent'))+'</div>'+
        '<div class="d365-msg '+(isUser?'user':'agent')+'">'+text+'</div>'+
        '<div class="d365-msg-time">'+formatTime(new Date())+'</div>';

      wrap.appendChild(avatar);
      wrap.appendChild(content);
      typing.parentNode.insertBefore(wrap, typing);
      messages.scrollTop = messages.scrollHeight;

      if (!isUser) {
        playNotificationSound();
        if (!container.classList.contains('open')) {
          unreadCount++;
          badge.textContent = unreadCount;
          badge.classList.add('show');
        }
      }
    }

    function isAdaptiveCard(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        if (p.type === 'AdaptiveCard') return true;
        if (p.attachments) return p.attachments.some(function(a) {
          return a.contentType === 'application/vnd.microsoft.card.adaptive';
        });
      } catch(e) {}
      return false;
    }

    function isHeroCard(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        if (p.contentType === 'application/vnd.microsoft.card.hero') return true;
        if (p.attachments) return p.attachments.some(function(a) {
          return a.contentType === 'application/vnd.microsoft.card.hero' ||
                 a.contentType === 'application/vnd.microsoft.card.thumbnail';
        });
      } catch(e) {}
      return false;
    }

    function isSuggestedActions(content) {
      if (!content || typeof content !== 'string') return false;
      try {
        var p = JSON.parse(content);
        return p.suggestedActions && p.suggestedActions.actions && p.suggestedActions.actions.length > 0;
      } catch(e) {}
      return false;
    }

    function addAdaptiveCard(content, senderName, isBotMsg) {
      var wrap = document.createElement('div');
      wrap.className = 'd365-msg-wrap agent';

      var avatar = document.createElement('div');
      var isBotAvatar = isBotMsg || isBot(senderName);
      avatar.className = 'd365-msg-avatar ' + (isBotAvatar ? 'bot' : 'agent');
      
      if (isBotAvatar && config.botAvatar) avatar.innerHTML = '<img src="'+config.botAvatar+'">';
      else if (!isBotAvatar && config.agentAvatar) avatar.innerHTML = '<img src="'+config.agentAvatar+'">';
      else avatar.textContent = getInitials(senderName || 'Agent');

      var contentDiv = document.createElement('div');
      contentDiv.className = 'd365-msg-content';

      // Create sender div
      var senderDiv = document.createElement('div');
      senderDiv.className = 'd365-msg-sender';
      senderDiv.textContent = senderName || 'Agent';
      contentDiv.appendChild(senderDiv);

      var cardBox = document.createElement('div');
      cardBox.className = 'd365-msg agent d365-adaptive-card';

      try {
        var parsed = JSON.parse(content);
        var payload = parsed.type === 'AdaptiveCard' ? parsed : null;
        
        // Check for attachments format
        if (!payload && parsed.attachments) {
          var cardAtt = parsed.attachments.find(function(a) {
            return a.contentType === 'application/vnd.microsoft.card.adaptive' && a.content;
          });
          if (cardAtt) payload = cardAtt.content;
        }

        if (payload && typeof AdaptiveCards !== 'undefined') {
          var card = new AdaptiveCards.AdaptiveCard();
          
          // Configure host config for better styling
          card.hostConfig = new AdaptiveCards.HostConfig({
            fontFamily: "inherit",
            spacing: { small: 8, default: 12, medium: 16, large: 20, extraLarge: 24, padding: 16 },
            separator: { lineThickness: 1, lineColor: "#e2e8f0" },
            fontSizes: { small: 12, default: 14, medium: 16, large: 18, extraLarge: 20 },
            containerStyles: {
              default: { backgroundColor: "#ffffff", foregroundColors: { default: { default: "#2d3748", subtle: "#64748b" } } }
            }
          });
          
          card.parse(payload);
          
          card.onExecuteAction = function(action) {
            console.log('Adaptive Card action triggered:', action);
            console.log('Action type:', action.getJsonTypeName ? action.getJsonTypeName() : 'unknown');
            console.log('Action data:', action.data);
            console.log('chatSDK:', chatSDK ? 'exists' : 'null');
            console.log('chatStarted:', chatStarted);
            
            // Handle Submit actions - check multiple ways since constructor.name is unreliable
            var isSubmit = (action.data !== undefined) || 
                          (action.getJsonTypeName && action.getJsonTypeName() === 'Action.Submit') ||
                          (action instanceof AdaptiveCards.SubmitAction);
            
            if (isSubmit) {
              var data = action.data;
              console.log('Processing submit with data:', data);
              if (chatSDK && chatStarted) {
                // Disable the card after clicking
                cardBox.style.opacity = '0.6';
                cardBox.style.pointerEvents = 'none';
                
                var actionLabel = (data && data.actionSubmitId) || action.title || 'Submit';
                var sendContent = JSON.stringify({value: data});
                
                console.log('Sending message:', sendContent);
                chatSDK.sendMessage({ 
                  content: sendContent,
                  metadata: { 'microsoft.azure.communication.chat.bot.contenttype': 'azurebotservice.adaptivecard' }
                }).then(function() {
                  console.log('Message sent successfully');
                  addMessage(actionLabel, true, userName);
                }).catch(function(err) {
                  console.error('Error sending card response:', err);
                  cardBox.style.opacity = '1';
                  cardBox.style.pointerEvents = 'auto';
                });
              } else {
                console.warn('Cannot send - chatSDK or chatStarted is false');
              }
            } else if (action.url) {
              console.log('Opening URL:', action.url);
              window.open(action.url, '_blank');
            }
          };
          
          var rendered = card.render();
          if (rendered) {
            cardBox.appendChild(rendered);
            console.log('Adaptive Card rendered with action handler');
          }
        } else {
          console.warn('AdaptiveCards library not available or no payload');
        }
      } catch(e) {
        console.error('Error rendering Adaptive Card:', e);
        cardBox.innerHTML = '<p style="color:#e74c3c">Error displaying card</p>';
      }

      // Append cardBox BEFORE adding time (don't use innerHTML += which destroys event listeners!)
      contentDiv.appendChild(cardBox);
      
      // Create time div
      var timeDiv = document.createElement('div');
      timeDiv.className = 'd365-msg-time';
      timeDiv.textContent = formatTime(new Date());
      contentDiv.appendChild(timeDiv);

      wrap.appendChild(avatar);
      wrap.appendChild(contentDiv);
      typing.parentNode.insertBefore(wrap, typing);
      messages.scrollTop = messages.scrollHeight;
      playNotificationSound();
    }

    function createHeroCardElement(cardData, gradient) {
      var card = document.createElement('div');
      card.className = 'd365-hero-card';

      // Image
      if (cardData.images && cardData.images.length > 0 && cardData.images[0].url) {
        var img = document.createElement('img');
        img.src = cardData.images[0].url;
        img.alt = cardData.title || '';
        img.onerror = function() { this.style.display = 'none'; };
        card.appendChild(img);
      }

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'd365-hero-card-body';

      // Title
      if (cardData.title) {
        var titleDiv = document.createElement('div');
        titleDiv.className = 'd365-hero-card-title';
        titleDiv.textContent = cardData.title;
        bodyDiv.appendChild(titleDiv);
      }

      // Subtitle
      if (cardData.subtitle) {
        var subtitleDiv = document.createElement('div');
        subtitleDiv.className = 'd365-hero-card-subtitle';
        subtitleDiv.textContent = cardData.subtitle;
        bodyDiv.appendChild(subtitleDiv);
      }

      // Text
      if (cardData.text) {
        var textDiv = document.createElement('div');
        textDiv.className = 'd365-hero-card-text';
        textDiv.textContent = cardData.text;
        bodyDiv.appendChild(textDiv);
      }

      // Buttons
      if (cardData.buttons && cardData.buttons.length > 0) {
        var btnsDiv = document.createElement('div');
        btnsDiv.className = 'd365-hero-card-buttons';

        cardData.buttons.forEach(function(btn) {
          var button = document.createElement('button');
          button.className = 'd365-hero-card-btn';
          button.textContent = btn.title || btn.text || 'Click';
          
          button.onclick = function() {
            console.log('Hero card button clicked:', btn);
            var value = btn.value || btn.title;
            
            if (btn.type === 'openUrl' && btn.value) {
              window.open(btn.value, '_blank');
            } else if (chatSDK && chatStarted) {
              btnsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
              card.style.opacity = '0.7';
              
              chatSDK.sendMessage({ content: value }).then(function() {
                addMessage(btn.title || value, true, userName);
              }).catch(function(err) {
                console.error('Error sending hero card response:', err);
                btnsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = false; });
                card.style.opacity = '1';
              });
            }
          };
          
          btnsDiv.appendChild(button);
        });

        bodyDiv.appendChild(btnsDiv);
      }

      card.appendChild(bodyDiv);
      return card;
    }

    function addHeroCard(content, senderName, isBotMsg) {
      try {
        var parsed = JSON.parse(content);
        var heroCards = [];
        var isCarousel = false;
        var isBotAvatar = isBotMsg || isBot(senderName);
        
        // Extract hero cards from different formats
        if (parsed.contentType === 'application/vnd.microsoft.card.hero' && parsed.content) {
          heroCards.push(parsed.content);
        } else if (parsed.attachments && Array.isArray(parsed.attachments)) {
          heroCards = parsed.attachments
            .filter(function(att) {
              return (att.contentType === 'application/vnd.microsoft.card.hero' ||
                      att.contentType === 'application/vnd.microsoft.card.thumbnail') && att.content;
            })
            .map(function(att) { return att.content; });
          isCarousel = heroCards.length > 1 || parsed.attachmentLayout === 'carousel';
        }
        
        if (heroCards.length === 0) {
          console.warn('No hero cards found');
          addMessage(content, false, senderName, isBotMsg);
          return;
        }
        
        console.log('Rendering', heroCards.length, 'hero card(s), isCarousel:', isCarousel);
        
        // Create single message wrapper for all cards
        var wrap = document.createElement('div');
        wrap.className = 'd365-msg-wrap agent';

        var avatar = document.createElement('div');
        avatar.className = 'd365-msg-avatar ' + (isBotAvatar ? 'bot' : 'agent');
        
        if (isBotAvatar && config.botAvatar) avatar.innerHTML = '<img src="'+config.botAvatar+'">';
        else if (!isBotAvatar && config.agentAvatar) avatar.innerHTML = '<img src="'+config.agentAvatar+'">';
        else avatar.textContent = getInitials(senderName || 'Agent');

        var contentDiv = document.createElement('div');
        contentDiv.className = 'd365-msg-content';

        var senderDiv = document.createElement('div');
        senderDiv.className = 'd365-msg-sender';
        senderDiv.textContent = senderName || 'Agent';
        contentDiv.appendChild(senderDiv);

        if (isCarousel) {
          // Multiple cards - render as horizontal carousel
          var carouselWrap = document.createElement('div');
          carouselWrap.className = 'd365-hero-carousel-wrap';
          
          var carousel = document.createElement('div');
          carousel.className = 'd365-hero-carousel';
          
          heroCards.forEach(function(cardData) {
            carousel.appendChild(createHeroCardElement(cardData));
          });
          
          // Navigation buttons
          var prevBtn = document.createElement('button');
          prevBtn.className = 'd365-carousel-btn prev';
          prevBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
          prevBtn.onclick = function() { carousel.scrollBy({ left: -240, behavior: 'smooth' }); };
          
          var nextBtn = document.createElement('button');
          nextBtn.className = 'd365-carousel-btn next';
          nextBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
          nextBtn.onclick = function() { carousel.scrollBy({ left: 240, behavior: 'smooth' }); };
          
          carouselWrap.appendChild(prevBtn);
          carouselWrap.appendChild(carousel);
          carouselWrap.appendChild(nextBtn);
          contentDiv.appendChild(carouselWrap);
        } else {
          // Single card
          contentDiv.appendChild(createHeroCardElement(heroCards[0]));
        }

        var timeDiv = document.createElement('div');
        timeDiv.className = 'd365-msg-time';
        timeDiv.textContent = formatTime(new Date());
        contentDiv.appendChild(timeDiv);

        wrap.appendChild(avatar);
        wrap.appendChild(contentDiv);
        typing.parentNode.insertBefore(wrap, typing);
        messages.scrollTop = messages.scrollHeight;
        playNotificationSound();

        // Handle any text that came with the attachments
        if (parsed.text) {
          addMessage(parsed.text, false, senderName, isBotMsg);
        }
      } catch(e) {
        console.error('Error rendering Hero Card:', e);
        addMessage(content, false, senderName, isBotMsg);
      }
    }

    function addSuggestedActions(content, senderName, isBotMsg) {
      try {
        var parsed = JSON.parse(content);
        var text = parsed.text || '';
        var actions = parsed.suggestedActions.actions;
        var isBotAvatar = isBotMsg || isBot(senderName);

        var wrap = document.createElement('div');
        wrap.className = 'd365-msg-wrap agent';

        var avatar = document.createElement('div');
        avatar.className = 'd365-msg-avatar ' + (isBotAvatar ? 'bot' : 'agent');
        
        if (isBotAvatar && config.botAvatar) avatar.innerHTML = '<img src="'+config.botAvatar+'">';
        else if (!isBotAvatar && config.agentAvatar) avatar.innerHTML = '<img src="'+config.agentAvatar+'">';
        else avatar.textContent = getInitials(senderName || 'Agent');

        var contentDiv = document.createElement('div');
        contentDiv.className = 'd365-msg-content';

        var senderDiv = document.createElement('div');
        senderDiv.className = 'd365-msg-sender';
        senderDiv.textContent = senderName || 'Agent';
        contentDiv.appendChild(senderDiv);

        var bubble = document.createElement('div');
        bubble.className = 'd365-msg agent';
        if (text) bubble.textContent = text;

        var actionsDiv = document.createElement('div');
        actionsDiv.className = 'd365-suggested-actions';
        actions.forEach(function(a) {
          var btn = document.createElement('button');
          btn.className = 'd365-suggested-btn';
          btn.textContent = a.title || a.text;
          btn.onclick = function() {
            var val = a.value || a.title;
            if (chatSDK && chatStarted) {
              // Disable all buttons
              actionsDiv.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
              chatSDK.sendMessage({ content: val }).then(function() {
                addMessage(val, true, userName);
              });
            }
          };
          actionsDiv.appendChild(btn);
        });
        bubble.appendChild(actionsDiv);
        contentDiv.appendChild(bubble);

        var timeDiv = document.createElement('div');
        timeDiv.className = 'd365-msg-time';
        timeDiv.textContent = formatTime(new Date());
        contentDiv.appendChild(timeDiv);

        wrap.appendChild(avatar);
        wrap.appendChild(contentDiv);
        typing.parentNode.insertBefore(wrap, typing);
        messages.scrollTop = messages.scrollHeight;
        playNotificationSound();
      } catch(e) {
        addMessage(content, false, senderName, isBotMsg);
      }
    }

    function processMessage(msg) {
      if (!msg) return;
      var id = msg.messageId || msg.id || msg.clientmessageid;
      if (id && processedMsgs[id]) return;
      if (id) processedMsgs[id] = true;

      var content = msg.content || msg.text || msg.body;
      if (!content) return;

      var role = msg.role || msg.senderRole;
      
      // Extract sender name - check multiple possible locations
      var senderId = msg.senderId || msg.sender;
      var senderName = 'Agent';
      if (msg.senderDisplayName) {
        senderName = msg.senderDisplayName;
      } else if (typeof senderId === 'object' && senderId !== null) {
        senderName = senderId.displayName || senderId.name || 'Agent';
      } else if (typeof senderId === 'string' && senderId) {
        senderName = senderId;
      }

      // Skip user messages
      if (role === 'user' || role === 'User' || role === 1) return;

      // Handle system messages (centered, no avatar)
      var isSystem = role === 'system' || role === 'System' || role === 0;
      if (isSystem) {
        addSystemMessage(content);
        return;
      }

      // Detect bot by role OR by sender name
      var isBotMsg = isBotRole(role) || isBot(senderName);

      if (isAdaptiveCard(content)) addAdaptiveCard(content, senderName, isBotMsg);
      else if (isHeroCard(content)) addHeroCard(content, senderName, isBotMsg);
      else if (isSuggestedActions(content)) addSuggestedActions(content, senderName, isBotMsg);
      else addMessage(content, false, senderName, isBotMsg);
    }

    function addSystemMessage(text) {
      var wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.width = '100%';
      wrapper.style.animation = 'd365fadeIn .3s ease';
      
      var msg = document.createElement('div');
      msg.className = 'd365-system-msg';
      msg.textContent = text;
      
      wrapper.appendChild(msg);
      typing.parentNode.insertBefore(wrapper, typing);
      messages.scrollTop = messages.scrollHeight;
    }

    async function pollMessages() {
      if (!chatSDK || !chatStarted) return;
      try {
        var msgs = await chatSDK.getMessages();
        if (msgs && msgs.length) {
          // Sort messages by timestamp/sequence to ensure correct order
          msgs.sort(function(a, b) {
            // Try timestamp first
            var timeA = a.timestamp || a.createdOn || a.sentOn || a.originalarrivaltime || 0;
            var timeB = b.timestamp || b.createdOn || b.sentOn || b.originalarrivaltime || 0;
            if (timeA && timeB) {
              var dateA = new Date(timeA).getTime();
              var dateB = new Date(timeB).getTime();
              if (dateA !== dateB) return dateA - dateB;
            }
            // Fall back to sequence/order number
            var seqA = a.sequenceId || a.order || a.clientmessageid || 0;
            var seqB = b.sequenceId || b.order || b.clientmessageid || 0;
            return seqA - seqB;
          });
          msgs.forEach(processMessage);
        }
      } catch(e) {}
    }

    async function initChat(name, email, question) {
      userName = name;
      userEmail = email;
      showView('connecting');

      try {
        var SDKClass = typeof OmnichannelChatSDK !== 'undefined' ?
          (typeof OmnichannelChatSDK === 'function' ? OmnichannelChatSDK : OmnichannelChatSDK.default || OmnichannelChatSDK.OmnichannelChatSDK) :
          (typeof Microsoft !== 'undefined' && Microsoft.OmnichannelChatSDK ? Microsoft.OmnichannelChatSDK : null);

        if (!SDKClass) throw new Error('Chat SDK not loaded');

        chatSDK = new SDKClass({ orgId: config.orgId, orgUrl: config.orgUrl, widgetId: config.widgetId });
        await chatSDK.initialize();
        
        // Pre-load voice/video calling SDK BEFORE startChat
        await preloadVoiceVideoCallingSDK(chatSDK);

        chatSDK.onNewMessage(function(m) {
          if (m) processMessage(m);
          // Extract agent name from messages
          if (m && m.sender && m.sender.displayName) {
            var senderName = m.sender.displayName;
            if (!isBot(senderName)) currentAgentName = senderName;
          }
        });
        chatSDK.onTypingEvent(function() {
          typing.classList.add('active');
          setTimeout(function() { typing.classList.remove('active'); }, 3000);
        });
        chatSDK.onAgentEndSession(function() { 
          if (isInCall) endCall();
          showView('ended'); 
        });

        await chatSDK.startChat({
          customContext: {
            'emailaddress1': { value: email, isDisplayable: true },
            'Name': { value: name, isDisplayable: true }
          }
        });

        // Track chat started
        trackEvent('chat');
        
        chatStarted = true;
        showView('chat');
        
        // Initialize voice/video calling SDK AFTER startChat (chat token now valid)
        await initializeVoiceVideoCallingSDK(chatSDK);
        
        if (question) {
          addMessage(question, true, name);
          await chatSDK.sendMessage({ content: question });
        }
        setInterval(pollMessages, 3000);
      } catch(e) {
        console.error('D365 Widget init error:', e);
        alert('Failed to connect: ' + e.message);
        showView('prechat');
        $('d365StartBtn').disabled = false;
        $('d365StartBtn').textContent = config.startBtnText;
      }
    }

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || !chatSDK || !chatStarted) return;
      input.value = '';
      addMessage(text, true, userName);
      try { await chatSDK.sendMessage({ content: text }); } catch(e) {
        addMessage('Failed to send. Try again.', false, 'System');
      }
    }

    // Event listeners
    launcher.onclick = function() {
      container.classList.toggle('open');
      launcher.classList.toggle('open');
      if (container.classList.contains('open')) {
        unreadCount = 0;
        badge.textContent = '0';
        badge.classList.remove('show');
        if (!config.enablePrechatForm && !chatStarted) {
          // Use custom auth credentials if enabled, otherwise anonymous
          var authName = config.enableCustomAuth && config.customAuthName ? config.customAuthName : 'Anonymous';
          var authEmail = config.enableCustomAuth && config.customAuthEmail ? config.customAuthEmail : 'anonymous@example.com';
          initChat(authName, authEmail, '');
        }
      }
    };

    $('d365Minimize').onclick = function() {
      container.classList.remove('open');
      launcher.classList.remove('open');
    };

    $('d365Close').onclick = function() {
      if (chatStarted) confirm.classList.add('show');
      else { container.classList.remove('open'); launcher.classList.remove('open'); }
    };

    $('d365ConfirmNo').onclick = function() { confirm.classList.remove('show'); };
    $('d365ConfirmYes').onclick = async function() {
      confirm.classList.remove('show');
      if (chatSDK) try { await chatSDK.endChat(); } catch(e) {}
      showView('ended');
    };

    $('d365StartBtn').onclick = function() {
      var name = $('d365Name').value.trim();
      var email = $('d365Email').value.trim();
      var q = $('d365Question').value.trim();
      if (!name || !email) { alert('Please fill all required fields'); return; }
      this.disabled = true;
      this.textContent = 'Starting...';
      initChat(name, email, q);
    };

    $('d365SendBtn').onclick = sendMessage;
    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    $('d365AttachBtn').onclick = function() { $('d365File').click(); };
    $('d365File').onchange = function(e) {
      var file = e.target.files[0];
      if (!file || !chatSDK || !chatStarted) return;
      if (file.size > 25000000) { alert('File too large (max 25MB)'); return; }
      var reader = new FileReader();
      reader.onload = function(evt) {
        chatSDK.uploadFileAttachment({ name: file.name, type: file.type, data: evt.target.result })
          .then(function() { addMessage('📎 ' + file.name, true, userName); })
          .catch(function(err) { alert('Upload failed: ' + err.message); });
      };
      reader.readAsDataURL(file);
      this.value = '';
    };

    $('d365NewBtn').onclick = function() {
      chatStarted = false;
      chatSDK = null;
      processedMsgs = {};
      $('d365StartBtn').disabled = false;
      $('d365StartBtn').textContent = config.startBtnText;
      $('d365Name').value = '';
      $('d365Email').value = '';
      $('d365Question').value = '';
      while (messages.firstChild !== typing) messages.removeChild(messages.firstChild);
      showView('prechat');
    };

    // Voice input with visual indicator
    var recognition = null;
    var isRecording = false;
    var voiceBtn = $('d365VoiceBtn');
    var voiceRec = $('d365VoiceRec');
    var stopVoiceBtn = $('d365StopVoice');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        isRecording = true;
        if (voiceBtn) voiceBtn.classList.add('recording');
        if (voiceRec) voiceRec.classList.add('show');
      };

      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        if (input) input.value += transcript;
      };

      recognition.onend = function() {
        isRecording = false;
        if (voiceBtn) voiceBtn.classList.remove('recording');
        if (voiceRec) voiceRec.classList.remove('show');
      };

      recognition.onerror = function(event) {
        console.log('Speech recognition error:', event.error);
        isRecording = false;
        if (voiceBtn) voiceBtn.classList.remove('recording');
        if (voiceRec) voiceRec.classList.remove('show');
      };

      if (voiceBtn) {
        voiceBtn.onclick = function() {
          if (isRecording) {
            recognition.stop();
          } else {
            recognition.start();
          }
        };
      }

      if (stopVoiceBtn) {
        stopVoiceBtn.onclick = function() {
          recognition.stop();
        };
      }
    } else {
      // Speech recognition not supported - hide button
      if (voiceBtn) voiceBtn.style.display = 'none';
    }

    // Emoji button - show tooltip with keyboard shortcut
    var emojiBtn = $('d365EmojiBtn');
    if (emojiBtn) {
      emojiBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (input) input.focus();
        
        // Show tooltip with keyboard shortcut
        var isWindows = navigator.platform.indexOf('Win') > -1;
        var isMac = navigator.platform.indexOf('Mac') > -1;
        
        var tooltip = document.createElement('div');
        tooltip.style.cssText = 'position:fixed;bottom:120px;right:30px;background:#1e293b;color:white;padding:12px 16px;border-radius:8px;font-size:13px;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        
        if (isWindows) {
          tooltip.innerHTML = '<strong>💡 Tip:</strong> Press <kbd style="background:#374151;padding:2px 6px;border-radius:4px;margin:0 2px;">Win</kbd> + <kbd style="background:#374151;padding:2px 6px;border-radius:4px;margin:0 2px;">.</kbd> for emojis';
        } else if (isMac) {
          tooltip.innerHTML = '<strong>💡 Tip:</strong> Press <kbd style="background:#374151;padding:2px 6px;border-radius:4px;margin:0 2px;">Cmd</kbd> + <kbd style="background:#374151;padding:2px 6px;border-radius:4px;margin:0 2px;">Ctrl</kbd> + <kbd style="background:#374151;padding:2px 6px;border-radius:4px;margin:0 2px;">Space</kbd> for emojis';
        } else {
          tooltip.innerHTML = '<strong>💡 Tip:</strong> Use your keyboard emoji shortcut';
        }
        
        document.body.appendChild(tooltip);
        setTimeout(function() { tooltip.remove(); }, 3000);
      };
    }

    if (!config.enablePrechatForm) prechat.classList.add('hidden');
  }

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
