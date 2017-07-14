/*eslint-env jquery */
// ALT + SHIFT + 0  e  ALT+2
	
// $(document).onload(function() {
$(document).ready(function() {
	// Realiza o login
	logIn = function() {
		// var email = $('#inputEmail').val();
		// var password = $('#inputSenha').val();
		var email = 'admin@8moon.com';
		var password = 'admin.password';	

		// Autentica usuario		
		firebase.auth().signInWithEmailAndPassword(email, password).catch( function(error){
			var errorCode = error.code;
			var errorMessage = error.message;
			// alert(errorMessage);
			console.log(error);
		});
	
		// Mapeia acao para mudanca de status (logIn / logOut)
		firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
			loadMaintScreen();
			console.log("LogIn");
			toggleScreen("i");
		  } else {
			console.log("LogOut");
			toggleScreen("o");
		  }
		});	
	};	

	// Carrega a tela de manutenção
	loadMaintScreen = function(){
		// $("#welcomeText").text( "Bem vindo " + firebase.auth().currentUser.displayName + " !");
		$("#welcomeText").text( "Bem vindo " + "Admin" + " !");
		toggleScreen("i");
		loadItens();	
	};

	// Realiza o logout
	logOut = function(){
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
		switch(mode){
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

	// Adiciona produto
	insertItem = function() {
		// Cria novo produto
		var newItem = {
			"name": $('#formName').attr('value').val(),
			"value": $('#formValue').attr('value').val(),
			"qtd": $('#formQtd').attr('value').val(),
			"size": $('#formSize').attr('value').val(),
			"img": $('#formImg').attr('value').val(),
			"dept": $('#formDept').attr('value').val(),
		};
		
		saveImg(newItem.img);
		
		var refProd = firebase.database().ref("products");
		refProd.push(newItem);
		
		loadItens();
	};

	// Atualiza produto
	updateItem = function(itemId) {
		var updObj = {
			"dept" : "",
			"name" : "",
			"qtd"  : "",
			"value": "",
		};
		
		// Monta o objeto com novos valores
		for (var field in updObj){
			var fieldId = '#' + itemId + " #" + field;	
			updObj[field] = $(fieldId).val();
		};
		
		// Atualiza o produto
		var refPath = "products/" + itemId;
		var itemRef = firebase.database().ref(refPath);		
		itemRef.update( updObj );
		
		// Recarrega os itens
		loadItens();
	};

	// Remove produto
	deleteItem = function(itemId){
		var refPath = "products/" + itemId;
		var itemRef = firebase.database().ref(refPath);		
		itemRef.remove();
		
		loadItens();
	};

	// Salva imagem no storage
	saveImg = function(imgPath) {
		var storage = firebase.storage();
		var storageRef = storage.ref();
		storageRef.child('images').upload(imgPath, function(err, file) {
			if (err) {
				alert('Imagens foi salva!');
			};
		});
	};

	// Edita o produto
	set2Upd = function(itemId){
		var viewField = '#' + itemId + ' .viewField';		
		var editField = '#' + itemId + ' .editField';	
		var editBtn   = '#' + itemId + ' .editBtn';	
		
		if ($(editField).attr('display') == 'none'){
			$(editBtn).attr('onclick','').unbind('click');
			$(editBtn).click( function() {
				set2Upd(itemId);
			});
		} else {
			$(editBtn).click( function() {
				updateItem(itemId);
			});
		};
		
		$(viewField).toggle();		
		$(editField).toggle();		
	};

	// Insere itens na tabela de manutencao
	appendHTML = function(itens) {		
	   var itemKeys = Object.keys(itens);		
		// Monta cabeçalho
		var code = "<table class='table'> <thead> <tr>"
				+ "<th>Departamento</th>"
				+ "<th>Produto</th>"
				+ "<th>Quantidade</th> "
				+ "<th>Valor</th> "
				+ "<th>Edit/Dele</th> "
				+ "</tr> </thead> <tbody>";	
		// Monta tabela de produtos
		for (var i in itemKeys) {
			var id = itemKeys[i].toString();	
			var tableLine = "<tr id='" + id + "'>"
						+ "<td class='viewField'> <p id='' type='text' class=''>" + itens[id].dept + "</p> </td>" 
						+ "<td class='editField'> <input id='dept' type='text' class='form-control' value='" + itens[id].dept + "'></input> </td>" 
						+ "<td class='viewField'> <p id='' type='text' class='viewFields'>" + itens[id].name + "</p> </td>" 
						+ "<td class='editField'> <input id='name' type='text' class='form-control' value='" + itens[id].name + "'></input> </td>" 
						+ "<td class='viewField'> <p id='' type='number' class='viewFields'>" + itens[id].qtd + "</p> </td>" 
						+ "<td class='editField'> <input id='qtd' type='number' class='form-control' value='" + itens[id].qtd + "'></input> </td>" 
						+ "<td class='viewField'> <p id='' type='number' class='viewFields' step='0.01'>" + itens[id].value + "</p> </td>"
						+ "<td class='editField'> <input id='value' type='number' class='form-control' value='" + itens[id].value + "' step='0.01'></input> </td>"
						+ "<td> <span onclick=\"set2Upd('" + id +"');\" class='glyphicon glyphicon glyphicon-edit editBtn'></span>"
						+ "<span onclick=\"deleteItem('"+ id +"');\" class='glyphicon glyphicon-remove-circle removeBtn'></span> </td>"
						+ "</tr>";

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
			// Monta o HTML
			appendHTML(myData, '');
		});
	};

	////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////	
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyCYsRQQ2xTOkE7XIJSQxQYM_WaKsa-gtvY",
		authDomain: "moons-bazzar.firebaseapp.com",
		databaseURL: "https://moons-bazzar.firebaseio.com",
		projectId: "moons-bazzar",
		storageBucket: "moons-bazzar.appspot.com",
		messagingSenderId: "244394754480"
	};
	firebase.initializeApp(config);	
	
	// loadMaintScreen();
}); // end-$(document).ready