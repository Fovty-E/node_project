

// Making authenticated requests
async function processRequest(url, options = {}) {
    const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`, // Include access token in headers
        },
        credentials: 'include', // Ensure cookies are sent with cross-origin requests
    });
    if (response.status === 403) { // Token expired
        const refreshResponse = await fetch('/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Include cookies in cross-origin requests
        });

        if (refreshResponse.ok) {
            const { accessToken } = await refreshResponse.json();
            localStorage.setItem('accessToken', accessToken);
            // Retry the original request
            return processRequest(url, options);
        } else {
            // Handle redirection to login
            window.location.href = '/login';
        }
    }

    return response;
}

