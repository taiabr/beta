// ALT + SHIFT + 0  e  ALT+2 e ALT+1

var myDeparts = [];
var imgsMapp = [];	
var myGrid = {};
var myKart = {};
var firebaseConfig = {
	apiKey: "AIzaSyCYsRQQ2xTOkE7XIJSQxQYM_WaKsa-gtvY",
	authDomain: "moons-bazzar.firebaseapp.com",
	databaseURL: "https://moons-bazzar.firebaseio.com",
	projectId: "moons-bazzar",
	storageBucket: "moons-bazzar.appspot.com",
	messagingSenderId: "244394754480"
};	

// Grid
var clGrid = class{
	// Carrega o grid - loadGrid
	static load() {
		// Busca valores do firebase
		var ref = firebase.database().ref();
		ref.once("value").then(function(snapshot) {
			var myData = snapshot.child('products').val();
			
			myGrid = Object.assign({}, myData);
			clGrid.appendItens(myGrid);	
			setImgMapping(imgsMapp);	   
		});
	};
	// Recupera departamentos - getarrayDepart
	static getDeparts(objProds) {
		myDeparts = [];
		for(var id in objProds) {		
			var thisDepart = myDeparts.find( function(depart){ 
				return depart === objProds[id].dept 
			});				
			if(thisDepart === undefined || thisDepart === null){ 
				myDeparts.push(objProds[id].dept) 
			};				
		};		
		return myDeparts;
	};		
	// Insere HTML dos produtos no grid - appendGridItens
	static appendItens(myProds) {

		var code = '';
		
		//Limpa o HTML
		$('#pageGrid h3').remove();
		$('#pageGrid section').remove();
		
		myDeparts = clGrid.getDeparts(myProds);		
		
		//Cada departamento
		myDeparts.forEach(function(depart) {

			//Busca produtos daquele departamento
			var prodsInDepart = clGrid.getFilteredProds(myProds, 'dept', depart);

			//Se possuir produtos para esse departamento
			if (prodsInDepart != undefined && prodsInDepart != null) {

				var departProds = '';

				//Para cada produto desse departamento
				for (var id in prodsInDepart){
					var thisProd = prodsInDepart[id];
					
					if(thisProd != undefined){
						// Monta ID para o botao
						var btnId = '#add-' + thisProd.id;
						// Monta ID para a imagem
						var imgId = 'img-' + thisProd.id;
						var linkID = imgId + 'a';

						// Monta codigo do grid
						var newProd 
								= "<div class='col-6 col-sm-3 placeholder myProduct' id='" + thisProd.id + "'>" 
								// + "<a target='_blank' href='" + thisProd.img + "'>"
								+ "<a target='_blank' id='" + linkID + "'>"
								+ "<img id='" + imgId +  "' width='200' height='200' class='img-fluid' alt='" + thisProd.name + "'>" 
								+ "</a>" 
								+ "<table class='table'>" 
								+ "<tbody>" 
								+ "<tr>" 
								+ "<h4 class='prodName'>" + thisProd.name + "</h4>" 
								+ "</tr>" 
								+ "<tr>" 
								+ "<p class='prodSize'>" + thisProd.size + "</p>" 
								+ "</tr>" 
								+ "<tr>" 
								+ "<p class='prodValue'>" + 'R$ ' + thisProd.value + "</p>" 
								+ "</tr>" 
								+ "<tr>" 
								+ "<button class='addButton' id='" + btnId + "'>" 
								+ "<span class='glyphicon glyphicon-plus'></span>" 
								+ "<b>Comprar</b>" 
								+ "</button>" 
								+ "</tr>" 
								+ "</tbody>" 
								+ "</table>" 
								+ "</div>";

						departProds += newProd;
						setImgForMapp(thisProd.img, imgId);
					};
				};
				
				var newDepart 
							= "<h3 class='sectionTitle' id='" + depart + "'>" + depart + "</h3>" 
							+ "<section class='row text-center placeholders mySection'>" 
							+ departProds 
							+ "</section>";
			};

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
	static getFilteredProds(myProds, property, value){
		var filteredProds = {};
		
		for(var id in myProds){
			var thisProd = myProds[id];
			
			if(thisProd[property] === value){
				filteredProds[id] = myProds[id];
			};
		};
		
		return filteredProds;
	};
}; // end-clGrid

// Carrinho
var clKart = class{
	// Exibe/Esconde tela do carrinho - toggleKart
	static toggle() {
		disableMain();
		$('#kartScreen').toggle();
		clKart.load();			
	};
	//Adiciona ao carrinho - addToKart
	static addItem(itemId, addQtd) {
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
			myKart[ Object.entries(myKart).length ] = newItem;

		// Atualiza a qtd de itens no carrinho
		} else {
			if (gridItem.qtd < (kartItem.qtd + addQtd)) {
				alert('Sem quantidade suficiente!');
			} else {
				kartItem.qtd += addQtd;
			};
		};
	};
	// Carrega informação do carrinho - loadKart
	static load() {
		// Limpa a tabela HTML do carrinho
		$("#kartResult tr").remove();
		
		// Carrega a tabela HTML com o carrinho atualizado
		for (var id in myKart) { if (myKart[id].qtd > 0) { clKart.appendItem( myKart[id]); } };
	};
	// Insere HTML de item do carrinho - appendKartItem
	static appendItem(kartItem) {
		// Monta ID para o botao
		var btnId = 'remove-' + kartItem.id;

		// Adiciona linha à tabela do carrinho
		var code 
				= "<tr " + "id='" + kartItem.id + "'>" 
				+ "<td>" + kartItem.name + "</td>" 
				+ "<td>" + kartItem.size + "</td>" 
				+ "<td>" + 'R$ ' + kartItem.value + "</td>" 
				+ "<td>" + kartItem.qtd + "</td>" 
				+ "<td>" 
				+ "<button class='removeButton' id='" + btnId + "'>" 
				+ "<span class='glyphicon glyphicon-remove-circle'></span>" 
				+ "</button>" 
				+ "</td>" 
				+ "</tr>";
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
	static removeItem(itemId) {		
		var myItem = getById(itemId, myKart);
		if (myItem.qtd > 1) {
			myItem.qtd -= 1;
		} else {
			myItem.qtd = 0;
		};
	};
	// Limpa o carrinho - clearKart
	static clear() {
		myKart = {};
		// $("#kartResult tr").remove(); 
		clKart.load();
	};
	// Check Out
	static checkOut() {
		if(Object.entries(myKart).length > 0){
			clKart.toggle();
			clMail.toggle();				
		} else {
			alert("Carrinho vazio");
		};
	};		
}; // end-clKart

// Check Out
var clMail = class{	
	// Exibe/Esconde tela do Check Out
	static toggle(){
		disableMain();
		$('#mailScreen').toggle();
		clMail.load();
	};
	// Carrega formulario do email
	static load(){
		var totValue = 0.00;			
		var mail = "";
		
		for (var id in myKart) { 
			if (myKart[id].qtd > 0) {
				totValue += (myKart[id].qtd * myKart[id].value);
				mail += clMail.concatItem(myKart[id]);
			} 
		};
		mail += "Total(R$): " + totValue;
		
		$("#mailBody").text(mail);
	};
	// Monta texto de email do item
	static concatItem(item){
		return "\t" + "Produto:" 
			+ "\n" + "\t" + "\t" + "Nome: " +  item.name 
			+ "\n" + "\t" + "\t" + "Tamanho: " + item.size
			+ "\n" + "\t" + "\t" + "Qtd: " + item.qtd
			+ "\n" + "\t" + "\t" + "Valor(un.): " + item.value
			+ "\n";
	};
	// Limpa formulario de email
	static clear(){
		$(".mailInput").text('');	 		
	};
	// Envia o email
	static send(){			
		// Recupera / Valida informações do usuário
		var mailName = $("#mailName").val();
		var mailAddres = $("#mailAddres").val();
		var mailPhone = $("#mailPhone").val();			
		if ( clMail.validate(mailName, mailAddres, mailPhone) ){ return };	
		
		// Recupera informações do pedido							
		var userProds = $("#mailBody").text();	
		var userObs = $("#mailObs").val();
		if( userObs === "" ){ userObs = "Nenhuma observação" };
		var userInfo =  "Nome: " + mailName
						+ "\n" + "\t" + "E-mail: " + mailAddres
						+ "\n" + "\t" + "Telefone: " + mailPhone;	
					
		// Monta email
		var mailAdds = mailAddres + ", " + "contato.8moons@hotmail.com";
		var mailSubj = "[PEDIDO] " + mailName + " | " + new Date().toISOString() ;						
		var mailBody = "Carrinho:" 
					+ "\n" + userProds
					+ "\n" + "\n" + "Observações do pedido:"
					+ "\n" + "\t" + userObs
					+ "\n" + "\n" + "Meu contato: "
					+ "\n" + "\t" + userInfo;
		
		// Envia email
		if( confirm("Enviar pedido(email)?") ){
			Email.send( "contato.8moons@hotmail.com",
						"contato.8moons@hotmail.com",
						mailSubj,
						mailBody,
						"smtp.live.com",
						"contato.8moons@hotmail.com",
						"lu044118");
			clMail.clear();
			clMail.toggle();			
			alert("Pedido enviado!");
		};
	};
	// Valida informações do usuário
	static validate(name, mail, phone){		
		// Nome
		var nameErro = false;					
		if (nameErro){ alert("Nome inválido!") };
		// Email
		var mailErro = false;					
		if (mailErro){ alert("Email inválido!") };
		// Telefone
		var phoneErro = false;			
		if (phone.length < 9){ phoneErro = true };			
		if (phoneErro){ alert("Telefone inválido!") };
	};
}; // end-clMail
	
sendMail = function(){
	clMail.send();
};
checkOut = function(){
	clKart.checkOut();
};
clearKart = function(){
	clKart.clear();
};
toggleKart = function(){
	clKart.toggle();
};
toggleMail = function(){
	clMail.toggle();
};
disableMain = function(){	
	if( $('#kartScreen').is(":visible") || $('#mailScreen').is(":visible") ){
		$(".mainScreen").find('*').removeClass("disableClass");
	} else {
		$(".mainScreen").find('*').addClass("disableClass");
	};
};
getById = function(itemId, obj){		
	for (var i in obj) {
		if(obj[i].id === itemId){
			return obj[i];
		};
	};			
};
setImgForMapp = function(imgPath, id){
	var imgID = '#' + id;
	var map = {img: imgPath , id: imgID };
	imgsMapp.push(map);
};
setImgMapping = function(mapArray){
	for (var i = 0; i < mapArray.length; i++){
		setImg2Screen(mapArray[i].img, mapArray[i].id) 
	};		
};
setImg2Screen = function(imgPath, imgID){
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var imagesRef = storageRef.child('images');	
	imagesRef.child(imgPath).getDownloadURL().then(function(url) {				
		var linkID = imgID + 'a';
		$(imgID).attr("src", url);
		$(linkID).attr("href", url);
	});
};

////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////	
$(document).ready(function() {
	firebase.initializeApp(firebaseConfig);
	clGrid.load();
	setImgForMapp("logo-compact.png", "logoImg");	
}); // end-$(document).ready