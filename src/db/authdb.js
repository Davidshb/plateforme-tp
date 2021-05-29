const identifiants = [
	{login: 'Alvera94', password: 'j6_JIn2mDLNYzHG'},
	{login: 'Rossie.Sawayn2', password: 'y_ht_SwuXoxpa8K'},
	{login: 'Dario46', password: 'S7UFcQ2F4a5Z9EO'},
	{login: 'Georgiana57', password: '0g0bsCW5nnpFUI3'},
	{login: 'Vicente70', password: 'hTD5M5IupZ2lE2a'},
	{login: 'Tania52', password: 'Yd0Rb2M29AGb8ld'},
	{login: 'Mariam_Blick86', password: 'skLc6Nj8spvS8Z2'},
	{login: 'Dagmar.Powlowski46', password: 'kz4nvKAwZHTTr4F'},
	{login: 'Eileen.McLaughlin', password: 'KFeXwyzjELQ6W9A'},
	{login: 'test', password: 'pass'}
]

const autorisations = identifiants.map(elem => {
	let code = []
	for (let i = 0; i < 3; i++)
		if (Math.random() > .5)
			code.push(i)

	return {
		login: elem.login,
		code
	}
})

console.log(autorisations)

exports.check_ident = (login, password) => identifiants.some(value => value.login === login && value.password === password)

exports.check_code = (login, code) => autorisations.some(value => value.login === login && value.code.includes(code))
