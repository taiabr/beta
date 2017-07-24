// ALT + SHIFT + 0  e  ALT+1
var firebaseConfig = {
    apiKey: "AIzaSyCKNcEvx2LnTQNxV0oAvcMsi4hyKRTIas0",
    authDomain: "moonsbazaar.firebaseapp.com",
    databaseURL: "https://moonsbazaar.firebaseio.com",
    projectId: "moonsbazaar",
    storageBucket: "moonsbazaar.appspot.com",
    messagingSenderId: "220986707501"
};
var myItens = {};

// Realiza o login
logIn = function() {
	// Trigger para mudanca de status (logIn / logOut)
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			console.log("User OK");
		} else {
			console.log("User NOT OK");
		}
	});
	
	// Recupera informacoes
	// var email = "8moons.bazzar@gmail.com";			
	// var password = "admin.password";	
	var email = $('#inputEmail').val();			
	var password = $('#inputSenha').val();		
	
	// Autentica usuario	
	firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
		// Sucesso
		if (user) {
			// Carrega tela
			initMaintScreen();
			// Limpa credenciais
			$('#inputEmail').val("");
			$('#inputSenha').val("");
		};
	})
	// Erro
	.catch(function(error) {
		console.log(error);
		alert(error.message);
		// toggleVisibility("o");
	});
};

// Realiza o logout
logOut = function() {
	// Se possuir usuario logado
	if (firebase.auth().currentUser) {		
		// Logout
		firebase.auth().signOut().then(function() {
		// Sucesso
			console.log("Log Out com sucesso");
			toggleVisibility("o");
		// Erro
		}, function(error) {
			alert("Não foi possível realizar o Log Out");
		});
	} else {
		alert("Nenhum usuario logado");
		toggleVisibility("o");
	};
};

// Reseta senha
resetPassword = function(){
	var emailAddress = $('#inputEmail').val();
	
	if(emailAddress === ""){
		alert("Preencha o campo de email");
	} else {
		// Reseta senha e envia email de redefinicao
		firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
		// Sucesso
			alert("Foi enviado um email de redefinicao de senha");
		// Erro
		}, function(error) {
			console.log(error.message);
			alert("Erro!" + "\n" + "Favor contatar o administrador");
		});
		// Limpa campo de email
		$('#inputEmail').val("");
	};
};

// Exibe / Esconde tela de Login
toggleVisibility = function(mode) {
	switch (mode) {
		// LogOut
		case "o":
			$('#loginScreen').show();
			$('#maintScreen').hide();
			break;
		// LogIn
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

// Habilita / Desabilita tela de manutencao
toggleAbility = function(mode) {
	switch (mode) {
		case "e":
			$("#maintScreen").find('*').removeClass("disableClass");
			break;
		case "d":
			$("#maintScreen").find('*').addClass("disableClass");
			break;
	};
};

// Carrega a tela de manutenção
initMaintScreen = function() {
	// Seta titulo de boas vindas
	$("#welcomeText").text( "Bem vindo(a) " + firebase.auth().currentUser.displayName + " !");
	
	// Carrega produtos
	loadItens();
	toggleVisibility("i");
};

// Carrega tabela de manutencao
loadItens = function() {
	// Limpa tabela
	$('#itensDiv table').remove();

	// Busca valores do firebase
	var databaseRef = firebase.database().ref();
	databaseRef.once("value").then(function(snapshot) {	
		myItens = {};
		
		// Recupera os produtos
		var myData = snapshot.child('products').val();	
		myItens = Object.assign({}, myData);
		
		// Monta o HTML
		appendHTML(myItens);
	});
};

// Insere itens na tabela de manutencao
appendHTML = function(myItens) {
	// Monta cabeçalho
	var code = "<table class='table'> <thead> <tr>" +
		"<th class='centerClass'>Depart.</th>" +
		"<th class='centerClass'>Produto</th>" +
		"<th class='centerClass'>Tamanho</th>" +
		"<th class='centerClass'>Qtd</th> " +
		"<th class='centerClass'>Valor</th> " +
		"<th class='centerClass'>Edit/Dele</th> " +
		"</tr> </thead> <tbody>";
		
	// Monta tabela de produtos
	for (var id in myItens) {
		var tableLine = "<tr id='" + id + "'>" +
			"<td class='editField' style='display: none'> <input id='dept' type='text' class='form-control' value='" + myItens[id].dept + "'></input> </td>" +
			"<td class='editField' style='display: none'> <input id='name' type='text' class='form-control' value='" + myItens[id].name + "'></input> </td>" +
			"<td class='editField' style='display: none'> <input id='size' type='text' class='form-control' value='" + myItens[id].size + "'></input> </td>" +
			"<td class='editField' style='display: none'> <input id='qtd' type='number' class='form-control' value='" + myItens[id].qtd + "'></input> </td>" +
			"<td class='editField' style='display: none'> <input id='value' type='number' class='form-control' value='" + myItens[id].value + "' step='0.01'></input> </td>" +
			"<td class='viewField centerClass'> <p id='' type='text'>" + myItens[id].dept + "</p> </td>" +
			"<td class='viewField centerClass'> <p id='' type='text'>" + myItens[id].name + "</p> </td>" +
			"<td class='viewField centerClass'> <p id='' type='text'>" + myItens[id].size + "</p> </td>" +
			"<td class='viewField centerClass'> <p id='' type='number'>" + myItens[id].qtd + "</p> </td>" +
			"<td class='viewField centerClass'> <p id='' type='number' step='0.01'>" + myItens[id].value + "</p> </td>" +
			"<td> <span onclick=\"actUpdate('" + id + "');\" class='glyphicon glyphicon glyphicon-edit editBtn'></span>" +
			"<span onclick=\"actDelete('" + id + "');\" class='glyphicon glyphicon-remove-circle removeBtn'></span> </td>" +
			"</tr>";

		code += tableLine;
	};
	code += "</tbody> </table>";

	// Adiciona codigo ao HTML
	$('#itensDiv').append(code);
};

// ADICAO
actInsert = function() {
	var newItem = {};
	
    // Recupera imagem
	var imgFile = $('#formImg').prop('files');
	
	// Monta novo produto
	newItem["name"]  = $('#formName').val();
	newItem["value"] = $('#formValue').val();
	newItem["qtd"]   = $('#formQtd').val();
	newItem["size"]  = $('#formSize').val();
	newItem["dept"]  = $('#formDept').val();
	newItem["img"]   = imgFile[0].name;
	
    // Faz upload da imagem
	var uploadTask = uploadImg(imgFile[0]);
	
    // Inicia o monitor de status / Insere item no database
	insertMonitor(uploadTask, newItem);	
	
	// Limpa dados da tela
	$("#maintScreen .form-group input").val("");
};

// Salva imagem no storage
uploadImg = function(imgFile) {
	var storage = firebase.storage();
	var storageRef = storage.ref();
	
    // Faz upload da imagem
	var storagePath = "products/" + imgFile.name;
	return storageRef.child(storagePath).put(imgFile);
};

// Inicia o monitor de status
insertMonitor = function(uploadTask, newItem) {	
	
	if ( confirm("Inserir Produto?" + "\n" + "(Favor não sair da pagina)") ){
		// Desabilita tela
		toggleAbility("d");
    
		// Trigger para mudanca de status no upload da imagem
    	uploadTask.on('state_changed', function(snapshot) {
    		switch (snapshot.state) {
    			case 'paused':
    				console.log('Upload foi pausado');
    				break;
    			case 'running':
					// Exibe progresso
					var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					console.log('Progresso: ' + progress + '%');
    				break;
    		}    
    	}, function(error) {
    		alert("Erro durante upload da imagem!");
			// Habilita tela
    		toggleAbility("e");    
    	}, function() {
			// Insere item no database
			insertItem(newItem)
    		alert('Item inserido!');
			// Carrega itens
    		loadItens();
			// Habilita tela
    		toggleAbility("e");
    	});
	} else {
		alert("Adicao cancelada.");
	}
};

// Insere item na base
insertItem = function(newItem) {	
	var refProds = firebase.database().ref("products");
	refProds.push(newItem);
};

// ATUALIZACAO
actUpdate = function(itemId) {
	var viewField = '#' + itemId + ' .viewField';
	var editField = '#' + itemId + ' .editField';

	// Atualiza item
	if ( $(editField).is(":visible") ) {
		updateItem(itemId);
	};

	$(viewField).toggle();
	$(editField).toggle();
};

// Atualiza produto
updateItem = function(itemId) {
	var updObj = {
		"dept": "",
		"name": "",
		"size": "",
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

// DELECAO
actDelete = function() {
	// Remove imagem do produto / remove item do database
	deleteImg(itemId);
	
	// Recarrega os itens
	loadItens();	
};

// Deleta imagem do storage
deleteImg = function(itemId) {	
	var storagePath = "products/" + myItens[itemId].img;
	var imgRef = firebase.storage().ref(storagePath);
	
	// Desabilita tela
	toggleAbility("d");
	// Deleta imagem
	imgRef.delete().then(function() {
		// Deleta item do database
		deleteItem(itemId);		
		alert("Item removido com sucesso");
		
		// Habilita tela
		toggleAbility("e");
	}).catch(function(error) {
		alert("Erro ao remover o produto!" + "\n" + "Favor entrar em contato com o admnistrador.");
		toggleAbility("e");
	});
};

// Deleta produto do Database
deleteItem = function(itemId) {
	var refPath = "products/" + itemId;
	var itemRef = firebase.database().ref(refPath);
	
	// Remove produto
	itemRef.remove();
};

////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
	// Initialize Firebase
	firebase.initializeApp(firebaseConfig);
}); // end-$(document).ready
