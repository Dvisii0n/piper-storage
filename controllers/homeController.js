async function getHome(req, res, next) {
	try {
		if (!req.isAuthenticated()) return res.redirect("/login");
		res.render("home");
	} catch (err) {
		next(err);
	}
}

export { getHome };
