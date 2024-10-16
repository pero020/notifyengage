(function() {
  const apiUrl = "http://localhost:5001/notifications";
  const businessApiKey = "zpmpgp3ir5gfmz3xsrqxm";
  const notificationKey = 'notificationLastShown';
  const notificationCooldown = 30 * 60 * 1000;
  const notificationDuration = 15 * 1000; 

  const lastShown = localStorage.getItem(notificationKey);
  const now = new Date().getTime();

  if (lastShown && (now - lastShown < notificationCooldown)) {
    return;
  }

  const showNotification = (notification, callback) => {
    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.bottom = '20px';
    notificationElement.style.right = '20px';
    notificationElement.style.backgroundColor = '#444';
    notificationElement.style.color = '#fff';
    notificationElement.style.padding = '15px';
    notificationElement.style.borderRadius = '8px';
    notificationElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    notificationElement.style.fontFamily = 'Arial, sans-serif';
    notificationElement.style.fontSize = '14px';
    notificationElement.style.zIndex = '1000';
    notificationElement.style.opacity = '0';
    notificationElement.style.transition = 'opacity 0.5s ease';

    notificationElement.innerText = notification.message;

    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.style.opacity = '1';
    }, 100); 

    setTimeout(() => {
      notificationElement.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notificationElement);
        if (callback) {
          callback();
        }
      }, 500);
    }, notificationDuration);
  };

  fetch(`${apiUrl}?key=${businessApiKey}`)
    .then(response => response.json())
    .then(data => {
      if (data.notifications.length > 0) {
        const notifications = data.notifications;

        const showNextNotification = (index) => {
          if (index < notifications.length) {
            const notification = notifications[index];

            if (notification.url === window.location.hostname) {
              showNotification(notification, () => {
                setTimeout(() => {
                  showNextNotification(index + 1);
                }, 1000);
              });
            } else {
              showNextNotification(index + 1);
            }
          }
        };

        showNextNotification(0);

        localStorage.setItem(notificationKey, now.toString());
      }
    })
    .catch(error => console.error('Error fetching notifications:', error));
})();