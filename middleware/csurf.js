const csrfProtection = csurf({ cookie: true });

// Apply CSRF protection to all routes
app.use(csrfProtection);

// Middleware to set CSRF token
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});