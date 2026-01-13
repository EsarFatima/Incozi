document.addEventListener('DOMContentLoaded', function () {
	const btn = document.querySelector('.nav-toggle');
	const nav = document.getElementById('site-nav');
	if (!btn || !nav) return;

	btn.addEventListener('click', function () {
		const expanded = btn.getAttribute('aria-expanded') === 'true';
		btn.setAttribute('aria-expanded', String(!expanded));
		nav.classList.toggle('open');
	});
});
