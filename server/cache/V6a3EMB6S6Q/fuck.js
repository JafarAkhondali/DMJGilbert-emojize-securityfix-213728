var fs = require('fs');

fs.readFile("./data.json", 'utf8', function (err, data) {
	data = JSON.parse(data);
	var newData = []

	for (var i = 0; i < data.length; i++) {
		newData.push({});
	}
	fs.readdir('./capture/', function (err, files) {
		for (var i = 0; i < files.length; i++) {
			var index = parseInt(files[i].replace('.png', ''));
			newData[index] = data[i];
		}

		fs.writeFile("./new.json", JSON.stringify(newData), function (err) {});

	});

});
