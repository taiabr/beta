/*eslint-env jquery */
// ALT + SHIFT + 0  e  ALT+2
// Realiza o login
/*eslint-disable no-undef */
var myItens = {};

logIn = function() {
	// Mapeia acao para mudanca de status (logIn / logOut)
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			loadMaintScreen();
			console.log("User OK");
			toggleScreen("i");
		} else {
			console.log("User NOT OK");
			toggleScreen("o");
		}
	});
	
	// var email = $('#inputEmail').val();
	// var password = $('#inputSenha').val();
	var email = 'admin@8moon.com';
	var password = 'admin.password';

	// Autentica usuario		
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
		console.log(error);
		toggleScreen("o");
	});
};

// Carrega a tela de manutenção
loadMaintScreen = function() {
	$("#welcomeText").text( "Bem vindo " + firebase.auth().currentUser.displayName + " !");
	// $("#welcomeText").text("Bem vindo " + "Admin" + " !");
	toggleScreen("i");
	loadItens();
};

// Realiza o logout
logOut = function() {
	firebase.auth().signOut().then(function() {
		// Sign-out successful.
		console.log("Log Out com sucesso");
		toggleScreen("o");
	}, function(error) {
		alert("Não foi possível realizar o Log Out");
	});
};

// Exibe/Esconde tela de Login
toggleScreen = function(mode) {
	switch (mode) {
		case "o":
			$('#loginScreen').show();
			$('#maintScreen').hide();
			break;
		case "i":
			$('#loginScreen').hide();
			$('#maintScreen').show();
			break;
		default:
			$('#loginScreen').toggle();
			$('#maintScreen').toggle();
			break;
	};
};

// Atualiza produto
updateItem = function(itemId) {
	var updObj = {
		"dept": "",
		"name": "",
		"qtd": "",
		"value": "",
	};

	// Monta o objeto com novos valores
	for (var field in updObj) {
		var fieldId = '#' + itemId + " #" + field;
		updObj[field] = $(fieldId).val();
	};

	// Atualiza o produto
	var refPath = "products/" + itemId;
	var itemRef = firebase.database().ref(refPath);
	itemRef.update(updObj);

	// Recarrega os itens
	loadItens();
};

// Remove produto
deleteItem = function(itemId) {
	var refPath = "products/" + itemId;
	var itemRef = firebase.database().ref(refPath);

	
	deleteImg(itemId);
	itemRef.remove();
	
	loadItens();
};

// Adiciona produto
insertItem = function() {
	// Monta novo produto
	var newItem = {};
	newItem["name"] = $('#formName').attr('value');
	newItem["value"] = $('#formValue').attr('value');
	newItem["qtd"] = $('#formQtd').attr('value');
	newItem["size"] = $('#formSize').attr('value');
	newItem["dept"] = $('#formDept').attr('value');
    // Recupera imagem
	var imgFile = $('#formImg').prop('files');
	newItem["img"] = imgFile[0].name;
    // Insere item na base
	var refProd = firebase.database().ref("products");
	var newItemRef = refProd.push(newItem);
    // Faz upload da imagem
	uploadImg(imgFile[0], newItemRef.getKey());
};

// Salva imagem no storage
uploadImg = function(imgFile, newId) {
	var storage = firebase.storage();
	var storageRef = storage.ref();
    // Faz upload da imagem
	var storagePath = "images/" + imgFile.name;
	var uploadTask = storageRef.child(storagePath).put(imgFile);
    // Inicia o onitor de status do upload
	startMonitor(uploadTask, newId);
};

// Deleta imagem do storage
deleteImg = function(itemId) {	
	var storagePath = "images/" + myItens[itemId].img;
	var imgRef = firebase.storage().ref(storagePath);
	
	setScreen("d");
	
	imgRef.delete().then(function() {
		confirm("Item removido com sucesso");
		setScreen("e");
	}).catch(function(error) {
		alert("Erro ao remover a imagem do repositorio!" + "\n" + "Favor entrar em contato com o admnistrador");
		setScreen("e");
	});
};

startMonitor = function(uploadTask, itemId) {	
	setScreen("d");
	
	if ( confirm("Inserindo item." + "\n" + "Favor não sair da pagina") === false){
		deleteItem(itemId);
		alert("Ação cancelada!");
		setScreen("e");
	} else {
    
    	uploadTask.on('state_changed', 
    	   function(snapshot) {
    		var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    		console.log('Progresso: ' + progress + '%');
    		switch (snapshot.state) {
    			case 'paused':
    				console.log('Upload foi pausado');
    				break;
    			case 'running':
    				console.log('Upload em andamento');
    				break;
    		}
    
    	}, function(error) {
    		deleteItem(itemId);
    		alert("Erro durante upload da imagem!");
    		setScreen("e");
    
    	}, function() {
    		loadItens();
    		alert('Item inserido!');
    		setScreen("e");
    	});
	}
};

setScreen = function(mode) {
	switch (mode) {
		case "e":
			$("#maintScreen").find('*').removeClass("disableClass");
			break;
		case "d":
			$("#maintScreen").find('*').addClass("disableClass");
			break;
	};
};

// Edita o produto
set2Upd = function(itemId) {
	var viewField = '#' + itemId + ' .viewField';
	var editField = '#' + itemId + ' .editField';
	var editBtn = '#' + itemId + ' .editBtn';

	if ($(editField).attr('display') == 'none') {
		$(editBtn).attr('onclick', '').unbind('click');
		$(editBtn).click(function() {
			set2Upd(itemId);
		});
	} else {
		$(editBtn).click(function() {
			updateItem(itemId);
		});
	};

	$(viewField).toggle();
	$(editField).toggle();
};

// Insere itens na tabela de manutencao
appendHTML = function(itens) {
	// Monta cabeçalho
	var code = "<table class='table'> <thead> <tr>" +
		"<th>Departamento</th>" +
		"<th>Produto</th>" +
		"<th>Quantidade</th> " +
		"<th>Valor</th> " +
		"<th>Edit/Dele</th> " +
		"</tr> </thead> <tbody>";
	// Monta tabela de produtos
	for (var id in itens) {
		var tableLine = "<tr id='" + id + "'>" +
			"<td class='viewField'> <p id='' type='text' class=''>" + itens[id].dept + "</p> </td>" +
			"<td class='editField'> <input id='dept' type='text' class='form-control' value='" + itens[id].dept + "'></input> </td>" +
			"<td class='viewField'> <p id='' type='text' class='viewFields'>" + itens[id].name + "</p> </td>" +
			"<td class='editField'> <input id='name' type='text' class='form-control' value='" + itens[id].name + "'></input> </td>" +
			"<td class='viewField'> <p id='' type='number' class='viewFields'>" + itens[id].qtd + "</p> </td>" +
			"<td class='editField'> <input id='qtd' type='number' class='form-control' value='" + itens[id].qtd + "'></input> </td>" +
			"<td class='viewField'> <p id='' type='number' class='viewFields' step='0.01'>" + itens[id].value + "</p> </td>" +
			"<td class='editField'> <input id='value' type='number' class='form-control' value='" + itens[id].value + "' step='0.01'></input> </td>" +
			"<td> <span onclick=\"set2Upd('" + id + "');\" class='glyphicon glyphicon glyphicon-edit editBtn'></span>" +
			"<span onclick=\"deleteItem('" + id + "');\" class='glyphicon glyphicon-remove-circle removeBtn'></span> </td>" +
			"</tr>";

		code += tableLine;
	};
	code += "</tbody> </table>";

	// Adiciona codigo ao HTML
	$('#itensDiv').append(code);
	// Esconde campos de edição
	$('.editField').toggle();
};

// Carrega tabela de manutencao
loadItens = function() {
	$('#itensDiv table').remove();

	// Busca valores do firebase
	var databaseRef = firebase.database().ref();
	databaseRef.once("value").then(function(snapshot) {
		var myData = snapshot.child('products').val();
		myItens = {};
		myItens = Object.assign({}, myData);
		
		// Monta o HTML
		appendHTML(myData);
	});
};

// Initialize Firebase
var config = {
	apiKey: "AIzaSyCYsRQQ2xTOkE7XIJSQxQYM_WaKsa-gtvY",
	authDomain: "moons-bazzar.firebaseapp.com",
	databaseURL: "https://moons-bazzar.firebaseio.com",
	projectId: "moons-bazzar",
	storageBucket: "moons-bazzar.appspot.com",
	messagingSenderId: "244394754480"
};

////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
	firebase.initializeApp(config);
	// loadMaintScreen();
}); // end-$(document).ready
