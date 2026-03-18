async function checkAuth(req, res, next) {
	if (!req.isAuthenticated()) return res.redirect("/login");
	next();
}

export { checkAuth };
