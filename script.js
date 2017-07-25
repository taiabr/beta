// ALT + SHIFT + 0  e  ALT+2 e ALT+1
var firebaseConfig = {
	apiKey: "AIzaSyCKNcEvx2LnTQNxV0oAvcMsi4hyKRTIas0",
	authDomain: "moonsbazaar.firebaseapp.com",
	databaseURL: "https://moonsbazaar.firebaseio.com",
	projectId: "moonsbazaar",
	storageBucket: "moonsbazaar.appspot.com",
	messagingSenderId: "220986707501"
};
var myGrid = {};
var myDeparts = [];
var myImages = [];
var myKart = {};

// Grid
function clGrid() {}
// Carrega o grid - loadGrid
clGrid.load = function() {
	// Mapeia a imagems do logo
	clGrid.addMapping("logo", "logo-compact.png", "logoImg");
	// Mapeia os produtos
	try {
		// Busca valores do firebase
		var ref = firebase.database().ref();
		ref.once("value").then(function(snapshot) {
			var myData = snapshot.child('products').val();
			myGrid = Object.assign({}, myData);
			clGrid.appendItens(myGrid);
			clGrid.initMapping(myImages);

			var myInfo = snapshot.child('mailInfo').val();
			clMail.setInfo(Object.assign({}, myInfo));
		});
	} catch (err) {
		console.log("Não foi possível acessar o Firebase:" + "\n" + err.message);
	}
};
// Recupera departamentos - getarrayDepart
clGrid.getDeparts = function(objProds) {
	myDeparts = [];
	if (objProds != undefined) {
		for (var id in objProds) {
			var thisDepart = myDeparts.find(function(depart) {
				return depart === objProds[id].dept;
			});
			if (thisDepart === undefined || thisDepart === null) {
				myDeparts.push(objProds[id].dept);
			}
		}
	}
	return myDeparts;
};
// Monta o menu com os departamentos existentes
clGrid.loadMenuOptions = function(departs) {
	var code = "";
	for (var i = 0; i < departs.length; i++) {
		code += "<li class='nav-item'>" + "<a class='nav-link' href='#" + departs[i] + "'>" + departs[i] + "</a>" + "</li>" + "\n";
	}
	$("#menuOptions").append(code);
	$("#menuOptionsMobile").append(code);
};
// Insere HTML dos produtos no grid - appendGridItens
clGrid.appendItens = function(myProds) {

	var code = '';

	//Limpa o HTML
	$('#pageGrid h3').remove();
	$('#pageGrid section').remove();

	myDeparts = clGrid.getDeparts(myProds);
	clGrid.loadMenuOptions(myDeparts);

	//Cada departamento
	myDeparts.forEach(function(depart) {
		var newDepart = '';

		//Busca produtos daquele departamento
		var prodsInDepart = clGrid.getFilteredProds(myProds, 'dept', depart);

		//Se possuir produtos para esse departamento
		if (prodsInDepart != undefined && prodsInDepart != null) {

			var departProds = '';

			//Para cada produto desse departamento
			for (var id in prodsInDepart) {
				var thisProd = prodsInDepart[id];

				if (thisProd != undefined) {
					// Monta ID para o botao
					var btnId = 'add' + id;
					// Monta ID para a imagem
					var imgId = 'img' + id;
					var linkID = imgId + 'a';

					// Monta codigo do grid
					var newProd = "<div class='col-6 col-sm-3 placeholder myProduct' id='" + id + "'>" + "<a target='_blank' id='" + linkID + "'>" + "<div class='imgDiv'>" + "<img id='" + imgId + "' class='img-fluid prodImg' alt='" + thisProd.name + "'>" + "<span class='glyphicon glyphicon-zoom-in prodZoom'></span>" + "</div>" + "</a>" + "<table class='table'>" + "<tbody>" + "<tr>" + "<h4 class='prodName'>" + thisProd.name + "</h4>" + "</tr>" + "<tr>" + "<p class='prodSize'>Tamanho " + thisProd.size + "</p>" + "</tr>" + "<tr>" + "<p class='prodValue'>" + 'R$ ' + thisProd.value + "</p>" + "</tr>" + "<tr>" + "<button class='addButton' id='" + btnId + "'>" + "<span class='glyphicon glyphicon-plus'></span>" + "<b>Comprar</b>" + "</button>" + "</tr>" + "</tbody>" + "</table>" + "</div>";

					departProds += newProd;
					clGrid.addMapping('products', thisProd.img, imgId);
				}
			}

			newDepart
				= "<h3 class='sectionTitle underlineClass' id='" + depart + "'>" + depart + "</h3>" + "<section class='row text-center placeholders mySection'>" + departProds + "</section>";
		}

		code += newDepart;

	});

	// Adiciona codigo ao HTML
	$('#pageGrid').append(code);

	// Seta ação DE ADIÇÃO do botao
	$('.addButton').click(function() {
		var itemId = $(this).closest("div").attr('id');
		// Adiciona ao myKart[]
		clKart.addItem(itemId, 1);
	});
};
//Busca produtos de certo departamento
clGrid.getFilteredProds = function(myProds, property, value) {
	var filteredProds = {};

	for (var id in myProds) {
		var thisProd = myProds[id];

		if (thisProd[property] === value) {
			filteredProds[id] = myProds[id];
		}
	}

	return filteredProds;
};
// Mapeia nova imagem
clGrid.addMapping = function(imgForlder, imgPath, itemId) {
	var imgID = '#' + itemId;
	var map = {
		path: imgForlder,
		img: imgPath,
		id: imgID
	};
	myImages.push(map);
};
// Trata imagens mapeadas
clGrid.initMapping = function(mapArray) {
	for (var i = 0; i < mapArray.length; i++) {
		clGrid.setOnScreen(mapArray[i].path, mapArray[i].img, mapArray[i].id);
	}
};
// Adiciona imagem a tela
clGrid.setOnScreen = function(imgForlder, imgPath, imgID) {
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var imagesRef = storageRef.child(imgForlder);
	imagesRef.child(imgPath).getDownloadURL().then(function(url) {
		$(imgID).attr("src", url);
		var linkID = imgID + 'a';
		$(linkID).attr("href", url);
	});
};

// Carrinho
function clKart() {}
// Exibe/Esconde tela do carrinho - toggleKart
clKart.toggle = function() {
	disableMain();
	$('#kartScreen').toggle();
	clKart.load();
};
//Adiciona ao carrinho - addToKart
clKart.addItem = function(itemId, addQtd) {
	// Busca item no Grid
	var gridItem = getById(itemId, myGrid);
	// Busca item no carrinho
	var kartItem = getById(itemId, myKart);

	// Insere no carrinho
	if (kartItem === undefined) {
		// Monta novo item
		var newItem = Object.assign({}, gridItem);
		newItem.qtd = addQtd;

		// Adiciona ao carrinho
		myKart[itemId] = newItem;

		// Atualiza a qtd de itens no carrinho
	} else {
		if (gridItem.qtd < (kartItem.qtd + addQtd)) {
			alert('Sem quantidade suficiente!');
		} else {
			kartItem.qtd += addQtd;
		}
	}
};
// Carrega informação do carrinho - loadKart
clKart.load = function() {
	// Limpa a tabela HTML do carrinho
	$("#kartResult tr").remove();

	// Carrega a tabela HTML com o carrinho atualizado
	for (var id in myKart) {
		if (myKart[id].qtd > 0) {
			clKart.appendItem(id);
		}
	}
};
// Insere HTML de item do carrinho - appendKartItem
clKart.appendItem = function(itemId) {
	var kartItem = getById(itemId, myKart);
	// Monta ID para o botao
	var btnId = 'remove' + itemId;

	// Adiciona linha à tabela do carrinho
	var code = "<tr " + "id='" + itemId + "'>" + "<td>" + kartItem.name + "</td>" + "<td>" + kartItem.size + "</td>" + "<td>" + kartItem.value + "</td>" + "<td>" + kartItem.qtd + "</td>" + "<td>" + "<button class='removeButton' id='" + btnId + "'>" + "<span class='glyphicon glyphicon-remove-circle'></span>" + "</button>" + "</td>" + "</tr>";
	$('#kartResult').append(code);

	// Seta ação do botao
	btnId = '#' + btnId;
	$(btnId).click(function() {
		var itemId = $(this).closest("tr").attr('id');
		// remove do myKart[]
		clKart.removeItem(itemId);
		clKart.load();
	});
};
// Remove do carrinho - removeFromKart
clKart.removeItem = function(itemId) {
	var myItem = getById(itemId, myKart);
	if (myItem.qtd > 1) {
		myItem.qtd -= 1;
	} else {
		myItem.qtd = 0;
	}
};
// Limpa o carrinho - clearKart
clKart.clear = function() {
	myKart = {};
	// $("#kartResult tr").remove(); 
	clKart.load();
};
// Check Out
clKart.checkOut = function() {
	if (Object.entries(myKart).length > 0) {
		clKart.toggle();
		clMail.toggle();
	} else {
		alert("Carrinho vazio");
	}
};

// Check Out
function clMail() {
	this._mail = "";
	this._password = "";
	this._smtp = "";
}
clMail.setInfo = function(user) {
	clMail._mail = user.mail;
	clMail._password = user.password;
	clMail._smtp = user.smtp;
};
// Recupera informações de login para envio de email
clMail.sendRequest = function() {
	if (clMail._mail != "" && clMail._password != "") {
		clMail.send(clMail._mail, clMail._password, clMail._smtp);
	} else {
		// Busca dados do firebase
		var ref = firebase.database().ref();
		ref.once("value").then(function(snapshot) {
			var myData = snapshot.child('mailInfo').val();
			clMail.send(myData.mail, myData.password, myData.smtp);
		});
	}
};
// Exibe/Esconde tela do Check Out
clMail.toggle = function() {
	disableMain();
	$('#mailScreen').toggle();
	clMail.load();
};
// Carrega formulario do email
clMail.load = function() {
	var totValue = 0.00;
	var mail = "";

	for (var id in myKart) {
		if (myKart[id].qtd > 0) {
			totValue += (myKart[id].qtd * myKart[id].value);
			mail += clMail.concatItem(myKart[id]);
		}
	}
	mail += "Total(R$): " + totValue;

	$("#mailBody").text(mail);
};
// Monta texto de email do item
clMail.concatItem = function(item) {
	return "\t" + "Produto:" + "\n" + "\t" + "\t" + "Nome: " + item.name + "\n" + "\t" + "\t" + "Tamanho: " + item.size + "\n" + "\t" + "\t" + "Qtd: " + item.qtd + "\n" + "\t" + "\t" + "Valor(un.): " + item.value + "\n";
};
// Limpa formulario de email
clMail.clear = function() {
	$(".mailInput").text('');
};
// Envia o email
clMail.send = function(myMail, myPassword, mySmtp) {
	// Recupera e valida as informações do usuário		
	var mailName = $("#mailName").val();
	var mailAddres = $("#mailAddres").val();
	var mailPhone = $("#mailPhone").val();
	if (clMail.validate(mailName, mailAddres, mailPhone)) {
		return;
	}

	// Recupera informações do pedido							
	var userProds = $("#mailBody").text();
	var userObs = $("#mailObs").val();
	if (userObs === "") {
		userObs = "Nenhuma observação";
	}
	var userInfo = "Nome: " + mailName + "\n" + "\t" + "E-mail: " + mailAddres + "\n" + "\t" + "Telefone: " + mailPhone;

	// Monta email
	var mailTo = myMail + ", " + mailAddres;
	var mailSubj = "[PEDIDO] " + mailName + " | " + new Date().toISOString();
	var mailBody = "Carrinho:" + "\n" + userProds + "\n" + "\n" + "Observações do pedido:" + "\n" + "\t" + userObs + "\n" + "\n" + "Meu contato: " + "\n" + "\t" + userInfo;

	// Envia email
	if (confirm("Enviar pedido?")) {
		Email.send(myMail, //from
			mailTo, //to
			mailSubj, //subject
			mailBody, //body
			mySmtp, //smtp
			myMail, //login
			myPassword); //password
		clMail.clear();
		clMail.toggle();
		alert("Pedido enviado!");
	}
};
// Valida informações do usuário
clMail.validate = function(name, mail, phone) {
	// Nome
	var nameErro = false;
	if (nameErro) {
		alert("Nome inválido!");
	}
	// Email
	var mailErro = false;
	if (mailErro) {
		alert("Email inválido!");
	}
	// Telefone
	var phoneErro = false;
	if (phone.length < 9) {
		phoneErro = true;
	}
	if (phoneErro) {
		alert("Telefone inválido!");
	}
};

sendMail = function() {
	clMail.sendRequest();
};
checkOut = function() {
	clKart.checkOut();
};
clearKart = function() {
	clKart.clear();
};
toggleKart = function() {
	clKart.toggle();
};
toggleMail = function() {
	clMail.toggle();
};
disableMain = function() {
	if ($('#kartScreen').is(":visible") || $('#mailScreen').is(":visible")) {
		$(".mainScreen").find('*').removeClass("disableClass");
	} else {
		$(".mainScreen").find('*').addClass("disableClass");
	}
};
getById = function(itemId, obj) {
	for (var id in obj) {
		if (id === itemId) {
			return obj[id];
		}
	}
};

////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////	
$(document).ready(function() {
	firebase.initializeApp(firebaseConfig);
	clGrid.load();
}); // end-$(document).ready