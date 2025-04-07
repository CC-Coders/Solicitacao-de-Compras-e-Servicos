function beforeCancelProcess(colleagueId, processId) {
    var movimentos = hAPI.getCardValue("movimentos");
    if (movimentos != "") {
        movimentos = JSON.parse(movimentos);

        for (var i = 0; i < movimentos.length; i++) {
            if (movimentos[i].IDMOV && VerificaSeExisteMovimento(movimentos[i].IDMOV)) {
                cancelaMovimentos(movimentos[i].IDMOV);
            }
        }
    }
    EnviarEmailCancelamento();
}

function cancelaMovimentos(RMidmov) {
    var hoje = new Date();
    var dia = hoje.getDate();
    var mes = hoje.getMonth() + 1;
    var ano = hoje.getFullYear();
    dia = dia.toString();
    mes = mes.toString();
    ano = ano.toString();
    if (mes.length == 1)
        mes = "0" + mes;
    if (dia.length == 1)
        dia = "0" + dia;
    ano = ano.toString();
    var dataCancelamento = ano + "-" + mes + "-" + dia + "T00:00:00";

    var retorno = DatasetFactory.getDataset("CancelaMovimentoRM", null, [
        DatasetFactory.createConstraint("pIdmov", RMidmov, RMidmov, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", hAPI.getCardValue("coligada").split(" - ")[0], hAPI.getCardValue("coligada").split(" - ")[0], ConstraintType.MUST),
        DatasetFactory.createConstraint("pUsuarioRM", "fluig", "fluig", ConstraintType.MUST),
        DatasetFactory.createConstraint("pNumeromov", "", "", ConstraintType.MUST),
        DatasetFactory.createConstraint("pExercicioFiscal", "", "", ConstraintType.MUST),
        DatasetFactory.createConstraint("pDataCancelamento", dataCancelamento, dataCancelamento, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodtmv", hAPI.getCardValue("codtmv").split(" - ")[0], hAPI.getCardValue("codtmv").split(" - ")[0], ConstraintType.MUST),
        DatasetFactory.createConstraint("pProcessoFluig", hAPI.getCardValue('numProcess'), hAPI.getCardValue('numProcess'), ConstraintType.MUST)
    ], null);

    if (!retorno || retorno == "" || retorno == null) {
        throw "Houve um erro na comunicação com o webservice. Tente novamente!";
    }
    else {
        if (retorno.values[0][0] == "false") {
            log.info("Erro ao cancelar o movimento. Favor entrar em contato com o administrador do sistema. Mensagem: " + retorno.values[0][3]);
        }
        else {
            log.info("MOVIMENTO CANCELADO = " + RMidmov);
            
        }
    }
}

function VerificaSeExisteMovimento(IDMOV) {
    var ds = DatasetFactory.getDataset("ConsultaMovimentoRM", null, [
        DatasetFactory.createConstraint("pIdmov", IDMOV, IDMOV, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", hAPI.getCardValue("coligada").split(" - ")[0], hAPI.getCardValue("coligada").split(" - ")[0], ConstraintType.MUST)
    ], null);


    if (ds.values && ds.values.length > 0) {
        return true;
    }
    else { return false; }
}

function EnviarEmailCancelamento() {
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


    subject = "[FLUIG] Pedido de compra cancelado!";
    mensagem = '<span class="glyphicon glyphicon-thumbs-down"></span> O pedido de compra que você realizou foi <font color="red"><b>cancelado</b></font> pelo usuário <b>' + usuarioAprovador + '.</b>';


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