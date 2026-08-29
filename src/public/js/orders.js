/* eslint-disable @typescript-eslint/no-unused-vars */
console.log('Orders frontend javascript file');

$(function () {
	$('.new-order-status').on('change', async function (e) {
		const orderId = e.target.id;
		const newStatus = $(`#${orderId}.new-order-status`).val();

		try {
			const csrfToken = document.body.dataset.csrf;
			const response = await axios.post('/admin/order/status', {
				orderId: orderId,
				newStatus: newStatus,
				csrfToken: csrfToken,
			});
			console.log('response:', response);
			const result = response.data;
			if (result.data) {
				$('.new-order-status').blur();
			} else alert('Order update failed!');
		} catch (err) {
			console.log(err);
			alert('Order update failed!');
		}
	});
});
