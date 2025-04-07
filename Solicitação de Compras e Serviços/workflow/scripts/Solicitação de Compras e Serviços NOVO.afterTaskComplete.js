function afterTaskComplete(colleagueId, nextSequenceId, userList) {
    var atividade = getValue("WKNumState");

    if (nextSequenceId != atividade) {
        if (hAPI.getCardValue("decisao") == "Aprovar") {
            if (atividade == 11 && hAPI.getCardValue("coordenadorAprov") == "") {
                var movimentos = JSON.parse(hAPI.getCardValue("movimentos"));

                for (var i = 0; i < movimentos.length; i++) {
                    BuscaRelatorio(movimentos[i].IDMOV, hAPI.getCardValue("coligada").split(" - ")[0]);
                }
                EnviarEmail();
            }
            else if (atividade == 12 && hAPI.getCardValue("diretorAprov") == "") {
                var movimentos = JSON.parse(hAPI.getCardValue("movimentos"));

                for (var i = 0; i < movimentos.length; i++) {
                    BuscaRelatorio(movimentos[i].IDMOV, hAPI.getCardValue("coligada").split(" - ")[0]);
                }
                EnviarEmail();
            }
            else if (atividade == 13) {
                var movimentos = JSON.parse(hAPI.getCardValue("cotacoes"));

                for (var i = 0; i < movimentos.length; i++) {
                    BuscaRelatorio(movimentos[i].IDMOV, hAPI.getCardValue("coligada").split(" - ")[0]);
                }
                EnviarEmail();
            }
        }
    }
}

function BuscaRelatorio(IDMOV, CODCOLIGADA) {
    var constraints = [
        DatasetFactory.createConstraint("IDMOV", IDMOV, IDMOV, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
    ];
    var wsReport = DatasetFactory.getDataset("relatoriosRM", null, constraints, null);

    // seta o formato de abertura da string base 64 retornada pelo Web Service do RM Reports para PDF
    if (wsReport.values[0][0] == true) {
        var resultado = wsReport.values[0][1];
        var constraints = [
            DatasetFactory.createConstraint("processo", getValue("WKNumProces"), getValue("WKNumProces"), ConstraintType.MUST),
            DatasetFactory.createConstraint("idRM", IDMOV, IDMOV, ConstraintType.MUST),
            DatasetFactory.createConstraint("conteudo", resultado, resultado, ConstraintType.MUST)
        ];

        var res = DatasetFactory.getDataset("CriacaoDocumentosFluig", null, constraints, null);

        if (!res || res == "" || res == null) {
            throw "Houve um erro na comunicação com o webservice de criação de documentos. Tente novamente!";
        }
        else {
            if (res.values[0][0] == "false") {
                throw "Erro ao criar arquivo. Favor entrar em contato com o administrador do sistema. Mensagem: " + res.values[0][1];
            }
            else {
                log.info("### GEROU docID = " + res.values[0][1]);
                hAPI.attachDocument(res.values[0][1]);
            }
        }
    }
    else {
        return false;
    }
}

function EnviarEmail() {
    var usuarioAprovador = getValue("WKUser");
    var comprador = hAPI.getCardValue('userComprador');
    var solicitante = hAPI.getCardValue('solicitante');
    var decisao = hAPI.getCardValue("decisao");
    var codColigada = hAPI.getCardValue('coligada');
    var codFilial = hAPI.getCardValue('filial');
    var localEstoque = hAPI.getCardValue('locEstoque');
    var data = hAPI.getCardValue('dataEntrega');
    var tipoMov = hAPI.getCardValue('codtmv');
    var valor = FormataValorParaMoeda(CalculaTotalSolicitacao(), 2, true);

    var urlProcesso = 'http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=' + hAPI.getCardValue("numProcess");
    var subject = '';
    var mensagem = '';

    if (decisao == "Aprovar") // Aprovar: SIM
    {
        subject = "[FLUIG] Pedido de compra aprovado!";
        mensagem = '<span class="glyphicon glyphicon-thumbs-up"></span> O pedido de compra que você realizou foi <font color="green"><b>aprovado</b></font> pelo usuário <b>' + usuarioAprovador + '.</b>';
    }
    else {
        subject = "[FLUIG] Pedido de compra cancelado!";
        mensagem = '<span class="glyphicon glyphicon-thumbs-down"></span> O pedido de compra que você realizou foi <font color="red"><b>cancelado</b></font> pelo usuário <b>' + usuarioAprovador + '.</b>';
    }

    var param = new java.util.HashMap();
    param.put("SERVER_URL", 'http://fluig.castilho.com.br:1010');//Prod
    //param.put("SERVER_URL", 'http://homologacao.castilho.com.br:2020');//homolog
    param.put("TENANT_ID", "1");
    param.put("USUARIO_APROVADOR", usuarioAprovador);
    param.put("COMPRADOR", comprador);
    param.put("SOLICITANTE", solicitante);
    param.put("COLIGADA", codColigada);
    param.put("FILIAL", codFilial);
    param.put("LOCALESTOQUE", localEstoque);
    param.put("DATA_CADASTRO", data);
    param.put("VALOR", valor);
    param.put("TIPOMOV", tipoMov);
    param.put("MENSAGEM", mensagem);
    param.put("URL", urlProcesso);
    param.put("subject", subject);

    var destinatarios = new java.util.ArrayList();

	if (solicitante != comprador) {
		destinatarios.add(solicitante);
		destinatarios.add(comprador);
	} else {
		destinatarios.add(solicitante);
	}

    var anexos = new java.util.ArrayList();
    var docs = hAPI.listAttachments();
    for (var i = 0; i < docs.size(); i++) {
        var doc = docs.get(i);
        var anexo = new java.util.HashMap();

        anexo.put("link", fluigAPI.getDocumentService().getDownloadURL(doc.getDocumentId()));
        anexo.put("description", doc.getDocumentDescription());

        anexos.add(anexo);
    }

    param.put("anexos", anexos);

    notifier.notify("FLUIG", "TPL_APROVACAO_COMPRAS", param, destinatarios, "text/html");
}

function FormataValorParaMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}