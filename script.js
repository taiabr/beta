// ALT + SHIFT + 0  e  ALT + 3
// USAR O STORAGE PRA GUARDAR AS IMAGENS

var myDeparts = [];
var imgsMapp = [];	
var myGrid = {};
var myKart = {};
	
$(document).ready(function() {
		
    // Grid
    var clGrid = class {
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
    var clKart = class {
        // Exibe/Esconde tela do carrinho - toggleKart
        static toggle() {
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
    }; // end-clKart
	
	// Login
    var clLogin = class {
        // Exibe/Esconde tela de Login - toggleLogin
        static toggle() {
            // Exibe a tela de login
            $('#loginScreen').toggle();
        };
        // Tenta realizar o login - logIn
        static logIn(email, password) {
			clFirebase.init();
            // Valida usuario
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;
				
				if (errorCode === 'auth/wrong-password') {
					alert('Wrong password.');
				} else {
					alert(errorMessage);
				}
				console.log(error);
				
            });
			clLogin.toggle();
        };
    }; // end-clLogin
    // Firebase (tutorial https://www.tutorialspoint.com/firebase)
    var clFirebase = class {
        // Inicializa - init
        static init() {
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
				};
        // Submit do formulario - submitForm
        static submit(action) {
            switch (action) {
                case 'INS':
					clFirebase.insert();
                    break;
                case 'DEL':
					clFirebase.insert();
                    break;
                case 'UPD':
					clFirebase.update();
                    break;
            };
        };
        // Adiciona produto - insProduct
        static insert(newProd) {
            var refProd = firebase.database().ref("products");
            refProd.push(newProd);
        };
        // Atualiza produto - updProduct
        static update(itemId, itemField, newValue) {
            var refPath = "products/" + itemId;
            var itemRef = firebase.database().ref(refPath);
            var updItem = Object.assign({}, myGrid[itemId]);

            updItem[itemField] = newValue;
            itemRef.update(updItem);
        };
        // Salva imagem no storage
        static saveImg(imgPath) {
			var storage = firebase.storage();
			var storageRef = storage.ref();
			storageRef.bucket.upload(imgPath, function(err, file){
				if (err){
					alert('Imagens foi salva!');
				};
			});
        };		
    }; // end-clFirebase

    clearKart = function() {
        clKart.clear();
    };
    toggleKart = function() {
        clKart.toggle();
    };
	getById = function(itemId, obj){		
		for (var i in obj) {
			if(obj[i].id === itemId){
				return obj[i];
			};
		};			
	};
	setImgMapping = function(mappingArray){
		for (var i = 0; i < mappingArray.length; i++){
			setImg2Screen(mappingArray[i].img, mappingArray[i].id);			
		};		
	};
	setImgForMapp = function(imgPath, id){
		var imgID = '#' + id;
		var map = {img: imgPath , id: imgID };
		imgsMapp.push(map);
	};
	setImg2Screen = function(imgPath, imgID) {
		var storage = firebase.storage();
		var storageRef = storage.ref();
		// storageRef.child(imgPath).getDownloadURL().then(function(url) {		
		
		var imagesRef = storageRef.child('images');	
		imagesRef.child(imgPath).getDownloadURL().then(function(url) {		
		
			var linkID = imgID + 'a';
			$(imgID).attr("src", url);
			$(linkID).attr("href", url);
		});
	};
	tryLogin = function(){
		var email = $('#inputEmail').val();
		var password = $('#inputSenha').val();		
		clLogin.logIn(email, password);	
	};	

    ////// Inicializando ///////////////////////////////////////////////////////////////////////////////////////////////////////	
	clFirebase.init();	
	clGrid.load();
    clKart.toggle();
	setImgForMapp("logo-compact.png", "logoImg");
	
}); // end-$(document).ready