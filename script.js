document.addEventListener('DOMContentLoaded', function () {
	const btn = document.querySelector('.nav-toggle');
	const nav = document.getElementById('site-nav');
	if (!btn || !nav) return;

	btn.addEventListener('click', function () {
		const expanded = btn.getAttribute('aria-expanded') === 'true';
		btn.setAttribute('aria-expanded', String(!expanded));
		nav.classList.toggle('open');
	});

	// Subscribe form handler
	const subscribeForm = document.getElementById('subscribe-form');
	const subscribeMsg = document.getElementById('subscribe-msg');
	if (subscribeForm) {
		subscribeForm.addEventListener('submit', async function (e) {
			e.preventDefault();
			subscribeMsg.textContent = '';
			const email = document.getElementById('subscribe-email').value.trim();
			try {
				const res = await fetch('/api/subscribe', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				});
				const data = await res.json();
				if (res.ok) subscribeMsg.textContent = data.message || 'Subscribed!';
				else subscribeMsg.textContent = data.error || 'Unable to subscribe';
			} catch (err) {
				subscribeMsg.textContent = 'Network error. Try again later.';
			}
		});
	}

	// Contact form handler
	const contactForm = document.getElementById('contact-form');
	const contactMsg = document.getElementById('contact-msg');
	if (contactForm) {
		contactForm.addEventListener('submit', async function (e) {
			e.preventDefault();
			contactMsg.textContent = '';
			const name = document.getElementById('name').value.trim();
			const email = document.getElementById('email').value.trim();
			const message = document.getElementById('message').value.trim();
			try {
				const res = await fetch('/api/contact', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, email, message })
				});
				const data = await res.json();
				if (res.ok) {
					contactMsg.textContent = data.message || 'Message sent!';
					contactForm.reset();
				} else contactMsg.textContent = data.error || 'Unable to send message';
			} catch (err) {
				contactMsg.textContent = 'Network error. Try again later.';
			}
		});
	}
});
