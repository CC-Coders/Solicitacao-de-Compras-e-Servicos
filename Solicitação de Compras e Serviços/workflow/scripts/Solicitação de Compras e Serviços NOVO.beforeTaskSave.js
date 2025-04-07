function beforeTaskSave(colleagueId, nextSequenceId, userList) {
    var atividade = getValue("WKNumState");
    log.info("Atividade OCs: " + atividade);

    if (nextSequenceId != atividade) {
        if (hAPI.getCardValue("decisao") == "Aprovar") {
            if (atividade == 5) {
                hAPI.setCardValue("userComprador", hAPI.getCardValue("userCode"));
                lancaMovimentos(colleagueId);
            }
            else if ((atividade == 11 && hAPI.getCardValue("coordenadorAprov") == "") || (atividade == 12 && hAPI.getCardValue("diretorAprov") == "") || (atividade == 13)) {
                var movimentos = hAPI.getCardValue("movimentos");
                movimentos = JSON.parse(movimentos);
                for (var i = 0; i < movimentos.length; i++) {
                    var retorno = aprovaMovimentos(movimentos[i].IDMOV, hAPI.getCardValue("coligada").split(" - ")[0], hAPI.getCardValue("codtmv").split(" - ")[0], colleagueId);

                    if (!retorno || retorno == "" || retorno == null) {
                        throw "Houve um erro na comunicação com o webservice. Tente novamente!";
                    }
                    else {
                        if (retorno.values[0][0] == "false") {
                            throw "Erro na Aprovação. Favor entrar em contato com o administrador do sistema. Mensagem: " + retorno.values[0][3];
                        }
                        else {
                            log.info("MOVIMENTO APROVADO = " + movimentos[i].IDMOV);
                        }
                    }
                }
            }

        }
        else if (hAPI.getCardValue("decisao") == "Retornar") {
            if (atividade == 5 || atividade == 14 || atividade == 11 || atividade == 12 || atividade == 13) {
                var comentario = getValue("WKUserComment");
                if (comentario == "") {
                    throw "Obrigatório informar um Complemento com o motivo do Retorno.";
                }
            }
        }
    }
}

function lancaMovimentos(colleagueId) {
    var movimentos = JSON.parse(hAPI.getCardValue("movimentos"));
    var cotacoes = JSON.parse(hAPI.getCardValue("cotacoes"));

    for (var i = 0; i < movimentos.length; i++) {
        var movimento = montaXML(movimentos[i]);

        if (movimento[0] == true) {
            movimentos[i].IDMOV = movimento[1];

            for (var j = 0; j < cotacoes.length; j++) {
                if (cotacoes[j].orcamentoId == movimentos[i].orcamentoId) {
                    cotacoes[j].IDMOV = movimento[1];
                }
            }

            if (hAPI.getCardValue("idOrigemRM") != "") {
                AtualizaMovOrigem(movimento[1]);
            }
        }
        else {
            hAPI.setCardValue("movimentos", JSONUtil.toJSON(movimentos));
            hAPI.setCardValue("cotacoes", JSONUtil.toJSON(cotacoes));
            throw movimento[1];
        }
    }
    hAPI.setCardValue("cotacoes", JSONUtil.toJSON(cotacoes));
    hAPI.setCardValue("movimentos", JSONUtil.toJSON(movimentos));
}

function FormataValor(valor) {
    valor = valor.split("R$ ")[1];
    return valor;
}

function ImportaMovimento(xml) {
    var ds = DatasetFactory.getDataset("ImportaMovRM", null, [
        DatasetFactory.createConstraint("xmlMov", xml, xml, ConstraintType.MUST),
        DatasetFactory.createConstraint("codColigada", hAPI.getCardValue("coligada").split(" - ")[0], hAPI.getCardValue("coligada").split(" - ")[0], ConstraintType.MUST)
    ], null);

    if (!ds || ds == "" || ds == null) {
        return [false, "Houve um erro na comunicação com o webservice. Tente novamente!"];
    }
    else {
        if (ds.values[0][0] == "false") {
            return [false, "Erro ao gerar movimento. Favor entrar em contato com o administrador do sistema. Mensagem: " + ds.values[0][1]];
        }
        else if (ds.values[0][0] == "true") {
            hAPI.setCardValue("idmov", hAPI.getCardValue("idmov") + ds.values[0][2] + ",");
            return [true, ds.values[0][2]];
        }
    }
}

function setDateXMLFormat(data, sql) // Formata data para inserção no XML
{
    var retorno = '';
    var n = data.indexOf("/");
    data = data.trim();
    var joinDtHr = '';
    if (sql == 1) {
        joinDtHr = ' ';
    } else {
        joinDtHr = 'T';
    }
    if (n == -1) {
        var tam = data.length;
        if (tam > 10) {
            retorno = retorno.replace(" ", joinDtHr);
            retorno = retorno + "00";
        } else {
            retorno = retorno;
        }
    }

    if (n == 2) {
        var temp = data.split("/");
        retorno = [temp[2], temp[1], temp[0]].join("-");
        retorno = retorno;
    }
    if (n == 4) {
        retorno = data.split("/").join("-");
        retorno = retorno;
    }
    return retorno;
}

function montaXML(cotacao) {
    log.info("IDMOV: " + cotacao.IDMOV);

    var CODCOLIGADA = hAPI.getCardValue("coligada").split(" - ")[0];
    var CODFILIAL = hAPI.getCardValue("filial").split(" - ")[0];
    var CODLOC = hAPI.getCardValue("locEstoque").split(" - ")[0];
    var CODTMV = hAPI.getCardValue("codtmv").split(" - ")[0];
    var CODTRA = hAPI.getCardValue("codTransporte").split(" - ")[0];
    var formaPgto = hAPI.getCardValue("formaPgto").split(" - ")[0];
    var przData = hAPI.getCardValue("dataEntrega");
    var URLFluig = "http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + hAPI.getCardValue("numProcess");
    var solicitante = hAPI.getCardValue("solicitante");
    var comprador = hAPI.getCardValue("userCode");
    var IDNAT = hAPI.getCardValue("natureza");
    var IDSISMA = hAPI.getCardValue("idSismaRM");
    var user = getValue("WKUser");

	var dataItensSisma;
	try {
	    dataItensSisma = JSON.parse(hAPI.getCardValue("dataItensSisma"));
	} catch (e) {
		log.info("error: "+e)
	}
	
    var reidi = hAPI.getCardValue('REIDI');
    if (reidi == "Sim") {
        reidi = "001";
    }
    else {
        reidi = "002";
    }


    var hoje = new Date();
    hoje = hoje.getFullYear() + "/" + ("0" + (hoje.getMonth() + 1)).slice(-2) + "/" + ("0" + hoje.getDate()).slice(-2);
    hoje = setDateXMLFormat(hoje, 0);


    var localDeEntrega = hAPI.getCardValue("locEntrega");
    if (hAPI.getCardValue("locEntrega2") != "") {
        localDeEntrega += " - " + hAPI.getCardValue("locEntrega2")
    }

    var xml = "";
    xml += "<MovMovimento>";
    xml += "<TMOV>";
    xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
    xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
    xml += "<NUMEROMOV>" + (cotacao.IDMOV ? BuscaNumeroMovimentoPorIDMOV(cotacao.IDMOV) : "-1") + "</NUMEROMOV> ";
    xml += "<CODFILIAL>" + CODFILIAL + "</CODFILIAL>";
    xml += "<CODLOC>" + CODLOC + "</CODLOC>";
    xml += "<CODTMV>" + CODTMV + "</CODTMV>";
    xml += "<TIPO>A</TIPO>";
    xml += "<STATUS>A</STATUS>";
    xml += "<DATAEMISSAO>" + hoje + "</DATAEMISSAO>";
    xml += "<DATASAIDA>" + hoje + "</DATASAIDA>";
    xml += "<CODTB1FLX>" + formaPgto + "</CODTB1FLX>";
    xml += "<CODTB3FLX>" + reidi + "</CODTB3FLX>";
    xml += "<CODMOEVALORLIQUIDO>R$</CODMOEVALORLIQUIDO>";
    xml += "<CODTRA>" + CODTRA + "</CODTRA>";
    xml += "<CAMPOLIVRE1>Favor informar o número da ordem de compra/serviço em dados adicionais da nota fiscal.</CAMPOLIVRE1>";
    xml += "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>";
    xml += "<CODCOLIGADA1>" + CODCOLIGADA + "</CODCOLIGADA1>";
    xml += "<HISTORICOCURTO>" + localDeEntrega + "</HISTORICOCURTO>";
    xml += "<CODCFO>" + cotacao.fornecedor.split("___")[1] + "</CODCFO>";
    xml += "<CODCFOAUX>" + cotacao.fornecedor.split("___")[1] + "</CODCFOAUX>";
    xml += "<CODCOLCFO>" + cotacao.fornecedor.split("___")[0] + "</CODCOLCFO>";
    xml += "<DATAENTREGA>" + setDateXMLFormat(przData, 0) + "</DATAENTREGA>";
    xml += "<CODCPG>" + cotacao.condicaoPagamento.split("___")[0] + "</CODCPG>";
    
    if (IDNAT != "" && IDNAT != null) {
        xml += "<IDNAT>" + IDNAT + "</IDNAT>";
    }
    xml += "</TMOV>";

    if (dataItensSisma && Array.isArray(dataItensSisma)) {
        for (var i = 0; i < cotacao.itens.length; i++) {
            var item = cotacao.itens[i];
            var IDPRD = item.IdPrdItem;
            var CODIGOPRD = item.CodPrdItem;
            var DESCPRODUTO = item.DescPrdItem;
            var DESCITEM = item.DescricaoItem;
            var QUANTIDADE = item.QuantidadeItem;
            var VALORUNIT = item.ValorUnitItem;
            var CODUND = item.CodUndItem;
            var CODTB1FAT = item.CODTB1FAT;

            var itemSisma = dataItensSisma[i] ? dataItensSisma[i].itemSisma : null;

            xml += "<TITMMOV>";
            xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
            xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
            xml += "<CODLOC>" + CODLOC + "</CODLOC>";
            xml += "<NSEQITMMOV>" + (i + 1) + "</NSEQITMMOV>";
            xml += "<NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>";
            xml += "<IDPRD>" + IDPRD + "</IDPRD>";
            xml += "<CODIGOPRD>" + CODIGOPRD + "</CODIGOPRD>";
            xml += "<NOMEFANTASIA>" + DESCPRODUTO + "</NOMEFANTASIA>";
            xml += "<QUANTIDADE>" + QUANTIDADE.split(".").join(",") + "</QUANTIDADE>";
            xml += "<PRECOUNITARIO>" + VALORUNIT.split(".").join(",") + "</PRECOUNITARIO>";
            xml += "<CODUND>" + CODUND + "</CODUND>";
            xml += "<VALORUNITARIO>" + VALORUNIT.split(".").join(",") + "</VALORUNITARIO>";
            xml += "<HISTORICOCURTO>" + DESCITEM + "</HISTORICOCURTO>";
            xml += "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>";
            xml += "<CODTB1FAT>" + CODTB1FAT + "</CODTB1FAT>";
            xml += "<IDMOVHST>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOVHST>";
            xml += "<CODCOLIGADA1>" + CODCOLIGADA + "</CODCOLIGADA1>";
            xml += "<NSEQITMMOV1>" + (i + 1) + "</NSEQITMMOV1>";
            xml += "<CAMPOLIVRE>" + (itemSisma ? itemSisma : '') + "</CAMPOLIVRE>";

            if (IDNAT != "" && IDNAT != null) {
                xml += "<IDNAT>" + IDNAT + "</IDNAT>";
            }
            xml += "</TITMMOV>";
        }
    }else{
	    for (var i = 0; i < cotacao.itens.length; i++) {
	        var item = cotacao.itens[i];
	        var IDPRD = item.IdPrdItem;
	        var CODIGOPRD = item.CodPrdItem;
	        var DESCPRODUTO = item.DescPrdItem;
	        var DESCITEM = item.DescricaoItem;
	        var QUANTIDADE = item.QuantidadeItem;
	        var VALORUNIT = item.ValorUnitItem;
	        var CODUND = item.CodUndItem;
	        var CODTB1FAT = item.CODTB1FAT;
	
	        xml += "<TITMMOV>";
	        xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
	        xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
	        xml += "<CODLOC>" + CODLOC + "</CODLOC>";
	        xml += "<NSEQITMMOV>" + (i + 1) + "</NSEQITMMOV>";
	        xml += "<NUMEROSEQUENCIAL>1</NUMEROSEQUENCIAL>";
	        xml += "<IDPRD>" + IDPRD + "</IDPRD>";
	        xml += "<CODIGOPRD>" + CODIGOPRD + "</CODIGOPRD>";
	        xml += "<NOMEFANTASIA>" + DESCPRODUTO + "</NOMEFANTASIA>";
	        xml += "<QUANTIDADE>" + QUANTIDADE.split(".").join(",") + "</QUANTIDADE>";
	        xml += "<PRECOUNITARIO>" + VALORUNIT.split(".").join(",") + "</PRECOUNITARIO>";
	        xml += "<CODUND>" + CODUND + "</CODUND>";
	        xml += "<VALORUNITARIO>" + VALORUNIT.split(".").join(",") + "</VALORUNITARIO>";
	        xml += "<HISTORICOCURTO>" + DESCITEM + "</HISTORICOCURTO>";
	        xml += "<INTEGRAAPLICACAO>T</INTEGRAAPLICACAO>";
	        xml += "<CODTB1FAT>" + CODTB1FAT + "</CODTB1FAT>";
	        xml += "<IDMOVHST>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOVHST>";
	        xml += "<CODCOLIGADA1>" + CODCOLIGADA + "</CODCOLIGADA1>";
	        xml += "<NSEQITMMOV1>" + (i + 1) + "</NSEQITMMOV1>";
	        if (IDNAT != "" && IDNAT != null) {
	            xml += "<IDNAT>" + IDNAT + "</IDNAT>";
	        }
	        xml += "</TITMMOV>"
	    }
	}

    for (var i = 0; i < cotacao.itens.length; i++) {
        var item = cotacao.itens[i];
        var CCUSTO = item.RateioCCusto.split(" - ")[0];

        xml += "<TITMMOVRATCCU>";
        xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
        xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
        xml += "<NSEQITMMOV>" + (i + 1) + "</NSEQITMMOV>";
        xml += "<CODCCUSTO>" + CCUSTO + "</CODCCUSTO>";
        xml += "<PERCENTUAL>100</PERCENTUAL>";
        xml += "<IDMOVRATCCU>-1</IDMOVRATCCU>";
        xml += "</TITMMOVRATCCU>";
    }

    for (var i = 0; i < cotacao.itens.length; i++) {
        var item = cotacao.itens[i];

        for (var j = 0; j < item.RateioDepto.length; j++) {
            var ratdep = item.RateioDepto[j];

            xml += "<TITMMOVRATDEP>";
            xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA>";
            xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
            xml += "<NSEQITMMOV>" + (i + 1) + "</NSEQITMMOV>";
            xml += "<CODFILIAL>" + CODFILIAL + "</CODFILIAL>";
            xml += "<CODDEPARTAMENTO>" + ratdep.Departamento.split(" - ")[0] + "</CODDEPARTAMENTO>";
            xml += "<PERCENTUAL>" + ratdep.Percentual + "</PERCENTUAL>";
            xml += "</TITMMOVRATDEP>";
        }
    }

    xml += "<TMOVCOMPL>";
    xml += "<CODCOLIGADA>" + CODCOLIGADA + "</CODCOLIGADA> ";
    xml += "<IDMOV>" + (cotacao.IDMOV ? cotacao.IDMOV : "-1") + "</IDMOV>";
    xml += "<FLUIG>" + URLFluig + "</FLUIG>";
    xml += "<USUARIO_SOLICITANTE>" + solicitante + "</USUARIO_SOLICITANTE>";
    xml += "<USUARIO_COMPRADOR>" + comprador + "</USUARIO_COMPRADOR>";
    xml += "<IDSISMA>"+IDSISMA+"</IDSISMA>";
    
    if (reidi == "001") {
        if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra Parapuã") {
            xml +=
                "<TEXTOREIDI>" +
                "Venda de bens e/ou serviços efetuada com suspensão da Contribuição para o PIS/PASEP e da COFINS conforme " +
                "Portaria do Ministerio da Infraestrutura N 1.958 de 22 de Setembro de 2020 e Ato Declaratorio Executivo N 80, " +
                "de 15 de Julho de 2022. Empresa Co-habilitada conforme §2° do Art. 5° da lei n°11.488/07." +
                "</TEXTOREIDI>";
        } else if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra Conserva Echaporã") {
            xml +=
                "<TEXTOREIDI>" +
                "Venda de bens e/ou serviços efetuada com suspensão da Contribuição para o PIS/PASEP e da COFINS conforme " +
                "Portaria do Ministerio da Infraestrutura N 978 de 07 de Dezembro de 2017 e Ato Declaratorio Executivo N 25, " +
                "de 26 de Maio de 2022. Empresa Co-habilitada conforme §2° do Art. 5° da lei n°11.488/07." +
                "</TEXTOREIDI>";
        } else if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra Duplicação Oriente") {
            xml +=
                "<TEXTOREIDI>" +
                "Venda de bens e/ou serviços efetuada com suspensão da Contribuição para o PIS/PASEP e da COFINS conforme " +
                "Portaria do Ministerio da Infraestrutura N 1.958 de 22 de Setembro de 2020 e Ato Declaratorio Executivo N 167, " +
                "de 10 de Novembro de 2022. Empresa Co-habilitada conforme §2° do Art. 5° da lei n°11.488/07." +
                "</TEXTOREIDI>";
        } else if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra COFCO") {
            xml +=
                "<TEXTOREIDI>" +
                "Venda ou serviço efetuada com suspensão da exigibilidade da Contribuição para o PIS/PASEP e da COFINS conforme " +
                "portaria do Ministério de Portos e Aeroportos Nº 196 de 24 de maio de 2023 e Ato Declaratório Executivo de nº288, " +
                "de 30 de outubro de 2023, publicado no Diário Oficial da União nº 207 de 31 de outubro de 2023." +
                "</TEXTOREIDI>";
        } else if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra Conserva Maracaí") {
            xml +=
                "<TEXTOREIDI>" +
                "Venda efetuada com suspensão da exigibilidade da Contribuição para o PIS/PASEP e da COFINS conforme " +
                "portaria do Ministério dos Transportes de número 1.935 e Ato Declaratório Executivo de nº491, " +
                "de 09 de abril de 2024, publicado no Diário Oficial da União nº69 de 10 de abril de 2024." +
                "</TEXTOREIDI>";
        } else if (hAPI.getCardValue("locEstoque").split(" - ")[1] == "Obra MRS Pátios Vale do Paraíba") {
            xml +=
                "<TEXTOREIDI>" +
                "Empresa co-habilitada ao Regime Especial de Incentivos para o Desenvolvimento da Infraestrutura (REIDI), " +
                "com suspensão do pagamento da Contribuição para o PIS/Pasep e da Cofins, através do Ato Declaratório Executivo DRF/SOR nº 4, de 7° de Janeiro de 2025." +
                "</TEXTOREIDI>";
        } else {
            xml +=
                "<TEXTOREIDI>" +
                "REIDI não configurado para o local de estoque selecionado, favor informar o administrador do sistema." +
                "</TEXTOREIDI>";
        }
    } else {
        xml +=
            "<TEXTOREIDI></TEXTOREIDI>";
    }
    xml += "</TMOVCOMPL>";
    xml += "</MovMovimento> ";

    log.info("XML: " + xml);


    var idmov = ImportaMovimento(xml);
    log.info("Movimentos inseridos: " + idmov);
    return idmov;
}

function aprovaMovimentos(IDMOV, CODCOLIGADA, CODTMV, usuarioAprovador) {
    var processoFluig = getValue("WKNumProces");

    var retorno = DatasetFactory.getDataset("ConsultaUsuarioRM", null, [
        DatasetFactory.createConstraint("pUsuario", usuarioAprovador, usuarioAprovador, ConstraintType.MUST)
    ], null);

    usuarioAprovador = retorno.getValue(0, "usuarioRM");

    var constraints = [
        DatasetFactory.createConstraint("pIdmov", IDMOV, IDMOV, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("pUsuarioRM", usuarioAprovador, usuarioAprovador, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodtmv", CODTMV, CODTMV, ConstraintType.MUST),
        DatasetFactory.createConstraint("pNumprocesso", processoFluig, processoFluig, ConstraintType.MUST)
    ];

    return DatasetFactory.getDataset("AprovaMovimentoRM", null, constraints, null);
}

function CalculaTotalSolicitacao() {
    var cotacoes = hAPI.getCardValue("cotacoes");

    if (cotacoes != "" && cotacoes != null && cotacoes != "[]") {
        cotacoes = JSON.parse(cotacoes);
        var cotacoes = JSON.parse(hAPI.getCardValue("cotacoes"));
        var total = 0;
    
        for (var i = 0; i < cotacoes.length; i++) {
            var cotacao = cotacoes[i];
    
            for (var j = 0; j < cotacao.itens.length; j++) {
                var item = cotacao.itens[j];
                total += parseFloat(item.QuantidadeItem) * parseFloat(item.ValorUnitItem);
            }
        }
        return total;
    
    }else{
        return 0;
    }


}

function BuscaNumeroMovimentoPorIDMOV(IDMOV) {
    var ds = DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
        DatasetFactory.createConstraint("operacao", "BuscaNumeroMovimentoPorIDMOV", "BuscaNumeroMovimentoPorIDMOV", ConstraintType.MUST),
        DatasetFactory.createConstraint("idmov", IDMOV, IDMOV, ConstraintType.MUST)
    ], null);

    return ds.getValue(0, "NUMEROMOV");
}

function AtualizaMovOrigem(IDMOV){
    var retorno = DatasetFactory.getDataset("AtualizaSolicitacaoCompraRM", null, [
        DatasetFactory.createConstraint("pIdOrigem", hAPI.getCardValue("idOrigemRM"), null, ConstraintType.MUST),
        DatasetFactory.createConstraint("pIdDestino", IDMOV, null, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", hAPI.getCardValue("coligada").split(" - ")[0], null, ConstraintType.MUST),
        DatasetFactory.createConstraint("pUsuarioRM", getValue("WKUser"), null, ConstraintType.MUST)
    ], null);

	if (!retorno || retorno == "" || retorno == null) {
        throw "Houve um erro na comunicação com o webservice. Tente novamente!";
    }
    else {
        if (retorno.values[0][0] == "false") {
            throw "Não foi possível atualizar o movimento de origem. Favor entrar em contato com o administrador do sistema. Mensagem: " + retorno.values[0][1];
        }
        else {
            //
        }
    }
}