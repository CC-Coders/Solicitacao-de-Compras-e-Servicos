function beforeStateEntry(sequenceId){
	var idOrigemRM = hAPI.getCardValue('idOrigemRM');
	var coligada = hAPI.getCardValue('coligada');
	var comprador = hAPI.getCardValue('solicitanteNome');
	
	if(comprador != "Sisma"){
		comprador = getValue("WKUser");
	}
		
	if (sequenceId == 5 && idOrigemRM != '') {
		var coligada = hAPI.getCardValue('coligada');
		ConsultaMovimento(idOrigemRM, coligada, true);
		ConsultaMovimentoItem(idOrigemRM, coligada, true, "tabelaPRD");			
	}	
	
	var atividade = getValue('WKCurrentState');
	
	if (atividade == 37) {
		var usuarioAprovador = getValue("WKUser");
		hAPI.setCardValue("usuarioAprovador", usuarioAprovador);
	}
}

function ConsultaMovimento(paramIdmov, paramCodcoligada, paramSisma) 
{
	var c1 = DatasetFactory.createConstraint("pIdmov", paramIdmov, paramIdmov, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("pCodcoligada", paramCodcoligada, paramCodcoligada, ConstraintType.MUST);
	var c3 = DatasetFactory.createConstraint("pSismaRM", paramSisma, paramSisma, ConstraintType.MUST);	
	var constraints = new Array(c1, c2, c3);
	var dataset = DatasetFactory.getDataset("ConsultaMovimentoRM", null, constraints, null);
	
	for (var y = 0; y < dataset.columnsCount; y++)
	{
		var coluna = dataset.columnsName[y];
		var campo = dataset.values[0][y];
		log.info("colunaaaa: " + coluna);
		log.info("campooo: " + campo);
		
		if(campo == "1.1.07"){
			campo = "1.1.07 - Ordem de Serviço";
			hAPI.setCardValue('codtmv',campo);
		}
		
		if(campo == "1.1.02"){
			campo = "1.1.02 - Ordem de Compra";
			hAPI.setCardValue('codtmv',campo);
		}
		
		if(campo == "1.1.10"){
			campo = "1.1.10 - Ordem de Transporte CTe";
			hAPI.setCardValue('codtmv',campo);
		}
		
		hAPI.setCardValue(coluna, campo);
		
	}
}

function ConsultaMovimentoItem(paramIdmov, paramCodcoligada, paramSisma, nomeTabela) 
{ 
    var c1 = DatasetFactory.createConstraint("pIdmov", paramIdmov, paramIdmov, ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint("pCodcoligada", paramCodcoligada, paramCodcoligada, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint("pSismaRM", paramSisma, paramSisma, ConstraintType.MUST);	
    var constraints = [c1, c2, c3];
    var dataset = DatasetFactory.getDataset("ConsultaMovimentoItemRM", null, constraints, null);

    var dataItens = [];
    
    log.info("Numero de linhas no dataset: " + dataset.values.length);

    for (var x = 0; x < dataset.values.length; x++) 
    {			
        var itens = {};  
        for (var y = 0; y < dataset.columnsCount; y++) 
        {
            var coluna = dataset.getColumnsName()[y]; 
            var campo = String(dataset.getValue(x, coluna));
            if (coluna === "prdQtd") 
            {
                campo = FormataValorString(campo);
            }

            itens[coluna] = campo;  
        }
        
        log.info("Produto " + (x + 1) + ": " + JSON.stringify(itens));

        dataItens.push(itens);
        log.info("valor de dataitens: " + dataItens);
    }
 
    var jsonString = JSON.stringify(dataItens);
    log.info("Final JSON: " + jsonString);
    
    hAPI.setCardValue("dataItensSisma", jsonString); 
}

function FormataValorString(valor)
{
	valorformat = valor.replace(".",",");
	comaposition = valor.indexOf(".");
	valorformat = valorformat.substring(0,comaposition+3);
	return valorformat;
}