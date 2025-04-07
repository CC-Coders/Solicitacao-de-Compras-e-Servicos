let modalNovoItem = null;
let dataTableNovoItem = null;
let listaProdutos = null;
let listaFornecedores = [];
let mapaDeCotacaoSelected = null;
let listaDepartamentosRateio = [];
let listaCentrosDeCusto = [];
let listaCondicaoDePagamento = [];
let calendar = [];

var atividade = WKNumState;

function buscaProdutos() {
    return new Promise((resolve, reject) => {
        var TipoProduto = null;
        if ($("#codtmv").val() == "1.1.02 - Ordem de Compra" || $("#codtmv").val() == "1.1.07 - Ordem de Serviço") {
            TipoProduto = "OC/OS";
        }else if($("#codtmv").val() == "1.1.10 - Ordem de Transporte CTe"){
            TipoProduto = "CT-e";
        }
        else{
            TipoProduto = "OC/OS";
        }

        DatasetFactory.getDataset("BuscaProdutosRM", null, [
            DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
            DatasetFactory.createConstraint("TipoProduto", TipoProduto, TipoProduto, ConstraintType.MUST)
        ], null, {
            success: (produtos => {
                resolve(produtos);
            }),
            error: (error) => {
                FLUIGC.toast({
                    title: "Erro ao buscar produtos: ",
                    message: error,
                    type: "warning"
                });
                reject();
            }
        });

       /* DatasetFactory.getDataset("consultaProdutoRM", null, [
            DatasetFactory.createConstraint("clg", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
            DatasetFactory.createConstraint("tp", 1, 1, ConstraintType.MUST)
        ], null, {
            success: (produtos => {
                resolve(produtos);
            }),
            error: (error) => {
                FLUIGC.toast({
                    title: "Erro ao buscar produtos: ",
                    message: error,
                    type: "warning"
                });
                reject();
            }
        });*/
    });
}

function BuscaColigadas() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
            DatasetFactory.createConstraint("operacao", "BuscaColigadas", "BuscaColigadas", ConstraintType.MUST),
            DatasetFactory.createConstraint("codusuario", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("permissaoGeral", (VerificaSeUsuarioPermissaoGeral() == true ? "true" : "false"), (VerificaSeUsuarioPermissaoGeral() == true ? "true" : "false"), ConstraintType.MUST)
        ], null, {
            success: (coligadas => {
                var selected = $("#coligada").val();
                coligadas.values.forEach((coligada, i) => {
                    $("#coligada").append("<option value='" + coligada.CODCOLIGADA + " - " + coligada.COLIGADA + "'>" + coligada.CODCOLIGADA + " - " + coligada.COLIGADA + "</option>");
                    console.log(i + " - " + (coligadas.values.length + 1));
                    if (i == coligadas.values.length - 1) {
                        $("#coligada").val(selected);
                    }
                });
                resolve()
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar coligadas: ",
                    message: error,
                    type: warning
                });
                reject();
            })
        });
    })

}

function BuscaFilial() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
            DatasetFactory.createConstraint("operacao", "BuscaFilial", "BuscaFilial", ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (filiais => {
                var list = [];
                filiais.values.forEach((filial) => {
                    list.push({
                        value: filial.CODFILIAL + " - " + filial.FILIAL,
                        label: filial.CODFILIAL + " - " + filial.FILIAL
                    });
                });
                resolve(list);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar filiais: ",
                    message: error,
                    type: warning
                });
                reject();
            })
        });
    });
}

function BuscaLocalDeEstoque(Filial) {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
            DatasetFactory.createConstraint("operacao", "BuscaLocalDeEstoque", "BuscaLocalDeEstoque", ConstraintType.MUST),
            DatasetFactory.createConstraint("codusuario", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", Filial, Filial, ConstraintType.MUST),
            DatasetFactory.createConstraint("permissaoGeral", (VerificaSeUsuarioPermissaoGeral() == true ? "true" : "false"), (VerificaSeUsuarioPermissaoGeral() == true ? "true" : "false"), ConstraintType.MUST)
        ], null, {
            success: (locaisDeEstoque => {
                var list = [];
                locaisDeEstoque.values.forEach((localDeEstoque, i) => {
                    list.push({
                        value: localDeEstoque.CODLOC + " - " + localDeEstoque.NOME,
                        label: localDeEstoque.CODLOC + " - " + localDeEstoque.NOME
                    });
                });
                resolve(list);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar local de estoque: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaCondicaoDePagamento() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
            DatasetFactory.createConstraint("operacao", "BuscaCondicaoDePagamento", "BuscaCondicaoDePagamento", ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (condicoesDePagto => {
                var list = [];
                condicoesDePagto.values.forEach(condicao => {
                    list.push({
                        value: condicao.CODCPG + "___" + condicao.NOME,
                        label: condicao.NOME
                    });
                });
                resolve(list);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar condições de pagamento: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaFormaDePagamento() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
            DatasetFactory.createConstraint("operacao", "BuscaFormaDePagamento", "BuscaFormaDePagamento", ConstraintType.MUST),
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (formasDePagto => {
                var list = [];
                formasDePagto.values.forEach(formaDePagto => {
                    list.push({
                        value: formaDePagto.CODTB1FLX + " - " + formaDePagto.DESCRICAO,
                        label: formaDePagto.CODTB1FLX + " - " + formaDePagto.DESCRICAO
                    });
                });
                resolve(list);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar formas de pagamento: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaTransporte() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("TTRARM", null, [
            DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (transportes => {
                var list = [];
                transportes.values.forEach(transporte => {
                    list.push({
                        value: transporte.CODTRA + " - " + transporte.NOME,
                        label: transporte.NOME
                    })
                });
                resolve(list);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar o transporte: ",
                    message: error,
                    type: "warning"
                });

                reject();
            })
        });
    });
}

function ValidaAntesDeEnviarAtividade() {
    if ($("#atividade").val() == 0 || $("#atividade").val() == 4) {
        var valida = ValidaPreenchimentoInicio()

        if (valida != true) {
            return valida;
        }
        return true;
    }
    else if ($("#atividade").val() == 5) {
        if ($("[name='decisao']:checked").val() == "" || $("[name='decisao']:checked").val() == undefined) {

            $([document.documentElement, document.body]).animate({
                scrollTop: $("#divDecisao").offset().top - (screen.height * 0.1)
            }, 700);

            return "Nenhuma decisão selecionada!";
        }

        if ($("[name='decisao']:checked").val() == "Aprovar") {
            var valida = ValidaPreenchimentoOrcamento();
            if (valida != true) {
                return valida;
            }

            BuscaAprovadores();
            VerificaSeCompradorMatriz();
            NotificaOrcamento();
            return true;
        } else {

            if ($("#solicitante").val() == "assiste") {
                
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#divDecisao").offset().top - (screen.height * 0.1)
            }, 700);

            return "Solicitações iniciadas pelo SISMA não podem ser retornadas para a atividade de Inicio!";
            }

            var date = calendar.getDate()._d;
            var dia = date.getDate();
            dia = (dia.toString().length == 1 ? "0" + dia : dia);
            var mes = (date.getMonth() + 1);
            mes = (mes.toString().length == 1 ? "0" + mes : mes);
            var ano = date.getFullYear();
            date = dia + "/" + mes + "/" + ano;
            $("#dataEntrega").val(date);

            VerificaModificacoesNosItens();

            return true;
        }
    }
    else if ($("#atividade").val() == 14 || $("#atividade").val() == 11 || $("#atividade").val() == 12 || $("#atividade").val() == 13) {
        if ($("[name='decisao']:checked").val() == "" || $("[name='decisao']:checked").val() == undefined) {

            $([document.documentElement, document.body]).animate({
                scrollTop: $("#divDecisao").offset().top - (screen.height * 0.1)
            }, 700);

            return "Nenhuma decisão selecionada!";
        }
        else {
            return true;
        }
    }
    else {
        return true;
    }
}

function BuscaRateioPorCentroDeCusto() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("GCCUSTO", null, [
            DatasetFactory.createConstraint("ATIVO", "T", "T", ConstraintType.MUST),
            DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
            DatasetFactory.createConstraint("CODCCUSTO", "1.2.043", "1.2.043", ConstraintType.MUST_NOT)
        ], ["CODCCUSTO"], {
            success: (ds => {
                var retorno = [];
                ds.values.forEach(ccusto => {
                    retorno.push({
                        CODCCUSTO: ccusto.CODCCUSTO,
                        NOME: ccusto.NOME
                    })
                });
                listaCentrosDeCusto = retorno;
                resolve();
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar Centro de Custo: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaRateioPorDepartamento() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("DepartamentosRM", null, [
            DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
            DatasetFactory.createConstraint("codfilial", $("#filial").val().split(" - ")[0], $("#filial").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (ds => {
                var retorno = []
                ds.values.forEach(departamento => {
                    retorno.push({
                        CODDEPARTAMENTO: departamento.coddepartamento,
                        NOME: departamento.nome
                    });
                });
                resolve(retorno);
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar Departamentos: ",
                    message: error,
                    type: "warning"
                });
                reject();
            })
        });
    });
}

function BuscaFornecedores() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("FCFO", ["CODCFO", "NOME", "CGCCFO"],
            [
                DatasetFactory.createConstraint("CODCOLIGADA", 0, 0, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.SHOULD),
                DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST),
            ], null, {
            success: (fornecedores => {
                listaFornecedores = fornecedores.values;
                resolve();
            }),
            error: (error => {
                FLUIGC.toast({
                    title: "Erro ao buscar Fornecedores: ",
                    message: error,
                    type: "warning"
                });
            })
        });
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function localStringToNumber(s) {
    return Number(String(s).replace(/[^0-9.-]+/g, ""))
}

function BuscaFornecedorPorCGCCFO(CGCCFO) {
    return DatasetFactory.getDataset("DatasetSolicitacaoDeCompraseServicos", null, [
        DatasetFactory.createConstraint("operacao", "BuscaFornecedorPorCGCCFO", "BuscaFornecedorPorCGCCFO", ConstraintType.MUST),
        DatasetFactory.createConstraint("cgccfo", CGCCFO, CGCCFO, ConstraintType.MUST)
    ], null).values[0];
}

function CarregaInfosAprov() {
    if ($("#formMode").val() != "VIEW") {
        $("#infoColigada").text($("#coligada").val());
        $("#infoFilial").text($("#filial").val());
        $("#infoTipoMov").text($("#codtmv").val());
        $("#infoLocEstoque").text($("#locEstoque").val());
        $("#infoComprador").text($("#userComprador").val());
    }
    else {
        $("#infoColigada").text($("#coligada").text());
        $("#infoFilial").text($("#filial").val());
        $("#infoTipoMov").text($("#codtmv").text());
        $("#infoLocEstoque").text($("#locEstoque").val());
        $("#infoComprador").text($("#userComprador").val());
    }
}

function BuscaAprovadores(total) {
    $("#chefeEngenheiroAprov, #coordenadorAprov, #diretorAprov").val("");
    var total = CalculaTotalSolicitacao();

    var ds = DatasetFactory.getDataset("verificaAprovador", null, [
        DatasetFactory.createConstraint("paramCodcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
        DatasetFactory.createConstraint("paramLocal", $("#locEstoque").val().split(" - ")[1], $("#locEstoque").val().split(" - ")[1], ConstraintType.MUST),
        DatasetFactory.createConstraint("paramCodTmv", $("#codtmv").val().split(" - ")[0], $("#codtmv").val().split(" - ")[0], ConstraintType.MUST),
        DatasetFactory.createConstraint("paramValorTotal", total, total, ConstraintType.MUST)
    ], null);

    let stopLoop = false;

    var eng = "";
    var coord = "";
    var dir = "";

    if ($("#comprador").val() == "Controladoria" && $("#locEstoque").val() == "001 - Matriz Curitiba") {
        eng = "claudio";
        if (total>=20000) {
            coord="padilha";
        }
        stopLoop = true;


        $("#chefeEngenheiroAprov").val(eng);
        $("#coordenadorAprov").val(coord);
        $("#diretorAprov").val(dir);
    }


    ds.values.forEach(aprovador => {
        if (stopLoop) {
            return;
        }

        if (verificaSeUsuarioAprovaCompras(aprovador.usuarioFLUIG)) {
            
        	if ($("#locEstoque").val().split(" - ")[1] == 'Obra COFCO' || $("#locEstoque").val().split(" - ")[1] == 'Obra MRS São Paulo' || $("#locEstoque").val().split(" - ")[1] == 'Obra MRS Manutenção São Paulo II' || 
        			$("#locEstoque").val().split(" - ")[1] == 'Obra MRS Remodelação Baixada Santista' || $("#locEstoque").val().split(" - ")[1] == 'Obra MRS Remodelação 2' || 
        			$("#locEstoque").val().split(" - ")[1] == 'Obra VLI Manutenção' || $("#locEstoque").val().split(" - ")[1] == 'Obra Rumo Pai Mathias' || 
        			$("#locEstoque").val().split(" - ")[1] == 'Obra Rumo Revitalização Serra' || $("#locEstoque").val().split(" - ")[1] == 'Obra Rumo Valongo' ||
        			$("#locEstoque").val().split(" - ")[1] == 'Obra VLI Planalto' || $("#locEstoque").val().split(" - ")[1] == 'Obra VLI Paulista' || 
        			$("#locEstoque").val().split(" - ")[1] == 'Obra VLI 5ª Linha TIPLAM' || $("#locEstoque").val().split(" - ")[1] == 'Obra MRS Pátios Vale do Paraíba') {
        	
	        	if (aprovador.limite <= 5000) {
	                eng = aprovador.usuarioFLUIG;
	            }
	            else if (aprovador.limite <= 250000) {
	                if (eng == "") {
	                    eng = aprovador.usuarioFLUIG;
	                }
	                else {
	                    coord = aprovador.usuarioFLUIG;
	                }
	            }
	            else {
	                if (eng == "") {
	                    eng = aprovador.usuarioFLUIG;
	                }
	                else if (coord == "") {
	                    coord = aprovador.usuarioFLUIG;
	                }
	                else {
	                    dir = aprovador.usuarioFLUIG;
	                }
	            }
	
	            if (parseFloat(aprovador.limite) >= parseFloat(total)) {
	                stopLoop = true;
	
	                $("#chefeEngenheiroAprov").val(eng);
	                $("#coordenadorAprov").val(coord);
	                $("#diretorAprov").val(dir);
	            }
        	}
        	else {
        		
        		if (aprovador.limite <= 20000) {
	                eng = aprovador.usuarioFLUIG;
	            }
	            else if (aprovador.limite <= 250000) {
	                if (eng == "") {
	                    eng = aprovador.usuarioFLUIG;
	                }
	                else {
	                    coord = aprovador.usuarioFLUIG;
	                }
	            }
	            else {
	                if (eng == "") {
	                    eng = aprovador.usuarioFLUIG;
	                }
	                else if (coord == "") {
	                    coord = aprovador.usuarioFLUIG;
	                }
	                else {
	                    dir = aprovador.usuarioFLUIG;
	                }
	            }
	
	            if (parseFloat(aprovador.limite) >= parseFloat(total)) {
	                stopLoop = true;
	
	                $("#chefeEngenheiroAprov").val(eng);
	                $("#coordenadorAprov").val(coord);
	                $("#diretorAprov").val(dir);
	            }
        		
        	}
        }
    });
}

function verificaSeUsuarioAprovaCompras(usuario) {
    var ds = DatasetFactory.getDataset("workflowColleagueRole", ["colleagueId"], [
        DatasetFactory.createConstraint("roleId", "aprovaCompras", "aprovaCompras", ConstraintType.MUST),
        DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)
    ], null);

    if (ds.values.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

function VerificaSeCompradorMatriz() {//Verifica se a solicitação deve passar pela aprovação superior do compras
    if ($("#userCode").val() != "karina.belli") {
        var ds = DatasetFactory.getDataset("colleagueGroup", null, [
            DatasetFactory.createConstraint("groupId", "Comprador", "Comprador", ConstraintType.MUST),
            DatasetFactory.createConstraint("colleagueId", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST)
        ], null);

        if (ds.values.length > 0) {
            $("#matrizSuperior").val("true");
        }
        else {
            $("#matrizSuperior").val("false");
        }
    }
    else {
        $("#matrizSuperior").val(0);
    }
}

function BuscaLocalDeEntrega() {
    return new Promise((resolve, reject) => {
        DatasetFactory.getDataset("MensagensEnderecoRM", null, [
            DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST)
        ], null, {
            success: (ds => {
                var list = [];

                for (var i = 0; i < ds.values.length; i++) {
                    list.push({
                        value: ds.values[i].descricao,
                        label: ds.values[i].descricao
                    });
                }

                resolve(list);
            }),
            error: (error => {
                console.error(error);
                reject();
            })
        });
    })
}

function CalculaTotalSolicitacao() {
    var cotacoes = JSON.parse($("#movimentos").val());

    var total = 0;
    cotacoes.forEach(cotacao => {
        cotacao.itens.forEach(item => {
            total += parseFloat(item.QuantidadeItem) * parseFloat(item.ValorUnitItem);
        });
    });

    return total;
}

function FormataValorParaMoeda(valor, decimais, reais = true) {
    if (isNaN(valor)) {
        return " - ";
    }

    if (valor) {
        valor = parseFloat(valor);
    }

    if (isNaN(decimais)) {
        decimais = 6;
    }

    return (reais ? "R$ " : "") + valor.toLocaleString("pt-br", {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais
    });
}

function ValidaPreenchimentoInicio() {
    var valida = true;

    if ($("#coligada").val() == "") {
        if (valida == true) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#coligada").offset().top - (screen.height * 0.1)
            }, 700);

            valida = "Coligada não selecionada!";
        }
    }
    else if ($("#codtmv").val() == "") {
        if (valida == true) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#codtmv").offset().top - (screen.height * 0.1)
            }, 700);

            valida = "Tipo de Movimento não selecionado!";
        }
    }
    else if ($("#filial").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#filial").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Filial não selecionada!";
        }
    }
    else if ($("#locEstoque").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#locEstoque").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Local de Estoque não selecionado!";
        }
    }
    else if ($("#comprador").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#comprador").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Comprador não selecionado!";
        }
    }
    else if ($("#dtEntrega").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#dataEntrega").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Data de Entrega não informada!";
        }
    }
    else if ($("#condicaoPgto").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#condicaoPgto").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Condição de Pagamento não selecionada!";
        }
    }
    else if ($("#formaPgto").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#formaPgto").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Forma de Pagamento não selecionada!";
        }
    }
    else if ($("#locEntrega").val() == "" && $("#locEntrega2").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#locEntrega").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Local de Entrega não informado!";
        }
    }
    else if ($("#itens").val() == "" || JSON.parse($("#itens").val()).length < 1) {
        $("#atabItens").trigger("click");
        $("#btnReturnItens").trigger("click");
        valida = "Nenhum item inserido!";
    }
    else if (valida == true) {
        var date = calendar.getDate()._d;
        var dia = date.getDate();
        dia = (dia.toString().length == 1 ? "0" + dia : dia);
        var mes = (date.getMonth() + 1);
        mes = (mes.toString().length == 1 ? "0" + mes : mes);
        var ano = date.getFullYear();
        date = dia + "/" + mes + "/" + ano;
        $("#dataEntrega").val(date);


        $("#App").find(".item").each(function () {
            if ($(this).find(".DescricaoItem").val() == "") {
                if (valida == true) {
                    $("#atabItens").trigger("click");
                    $("#btnReturnItens").trigger("click");

                    if ($(this).find(".panel-body").css("display") == "none") {
                        $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                    }



                    $(this).find(".tab:first").trigger("click");


                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).find(".DescricaoItem").offset().top - (screen.height * 0.1)
                    }, 700);

                    valida = "Descrição do Item não informada!";
                }
            }
            else if ($(this).find(".QuantidadeItem").val() == "") {
                if (valida == true) {
                    $("#atabItens").trigger("click");
                    $("#btnReturnItens").trigger("click");

                    if ($(this).find(".panel-body").css("display") == "none") {
                        $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                    }
                    $(this).find(".tab:first").trigger("click");

                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).find(".QuantidadeItem").offset().top - (screen.height * 0.1)
                    }, 700);

                    valida = "Quantidade do Item não informada!";
                }
            }
            else if ($(this).find(".RateioCCusto").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".RateioCCusto").find(".ant-select-selection-item").attr("title") == undefined) {
                if (valida == true) {
                    $("#atabItens").trigger("click");
                    $("#btnReturnItens").trigger("click");
                    if ($(this).find(".panel-body").css("display") == "none") {
                        $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                    }
                    $(this).find(".tab:last").trigger("click");


                    $([document.documentElement, document.body]).animate({
                        scrollTop: $(this).offset().top - (screen.height * 0.1)
                    }, 700);

                    valida = "Rateio por Centro de Custo não selecionado!";
                }
            }
            else {
                var percentualTotal = 0;

                if ($(this).find(".tableRateioDepartamento").find("tbody").find("tr").length < 1) {
                    if (valida == true) {
                        $("#atabItens").trigger("click");
                        $("#btnReturnItens").trigger("click");
                        if ($(this).find(".panel-body").css("display") == "none") {
                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                        }
                        $(this).find(".tab:last").trigger("click");
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.1)
                        }, 700);

                        valida = "Nenhum Departamento inserido nos Rateios do Item!";
                    }
                }

                $(this).find(".tableRateioDepartamento").find("tbody").find("tr").each(function () {
                    if ($(this).find(".selectDepartamento").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".selectDepartamento").find(".ant-select-selection-item").attr("title") == undefined) {
                        if (valida == true) {
                            $("#atabItens").trigger("click");
                            $("#btnReturnItens").trigger("click");
                            if ($(this).find(".panel-body").css("display") == "none") {
                                $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                            }
                            $(this).find(".tab:last").trigger("click");

                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                            }, 700);

                            valida = "Rateio por Departamento não selecionado!";
                        }
                    }
                    else if ($(this).find(".Percentual").val() == "" || $(this).find(".Percentual").val() == "%") {
                        if (valida == true) {
                            $("#atabItens").trigger("click");
                            $("#btnReturnItens").trigger("click");
                            if ($(this).find(".panel-body").css("display") == "none") {
                                $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                            }
                            $(this).find(".tab:last").trigger("click");

                            $([document.documentElement, document.body]).animate({
                                scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                            }, 700);

                            valida = "Percentual do Rateio por Departamento não informado!";
                        }
                    } else {
                        percentualTotal += parseFloat($(this).find(".Percentual").val().split(",").join("."));
                    }
                });


                if (percentualTotal != 100) {
                    if (valida == true) {
                        $("#atabItens").trigger("click");
                        $("#btnReturnItens").trigger("click");
                        if ($(this).find(".panel-body").css("display") == "none") {
                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                        }
                        $(this).find(".tab:last").trigger("click");

                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                        }, 700);

                        valida = "Percentual do Rateio por Departamento não atingiu 100%!";
                    }
                }




            }
        });
    }

    return valida;
}

function ValidaPreenchimentoOrcamento() {
    var valida = true;

    if ($("#coligada").val() == "") {
        if (valida == true) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#coligada").offset().top - (screen.height * 0.1)
            }, 700);

            valida = "Coligada não selecionada!";
        }
    }
    else if ($("#codtmv").val() == "") {
        if (valida == true) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#codtmv").offset().top - (screen.height * 0.1)
            }, 700);

            valida = "Tipo de Movimento não selecionado!";
        }
    }
    else if ($("#filial").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#filial").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Filial não selecionada!";
        }
    }
    else if ($("#locEstoque").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#locEstoque").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Local de Estoque não selecionado!";
        }
    }
    else if ($("#comprador").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#comprador").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Comprador não selecionado!";
        }
    }
    else if ($("#dtEntrega").val() == "") {

        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#dataEntrega").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Data de Entrega não informada!";
        }
    }
    else if ($("#condicaoPgto").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#condicaoPgto").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Condição de Pagamento não selecionada!";
        }
    }
    else if ($("#formaPgto").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#formaPgto").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Forma de Pagamento não selecionada!";
        }
    }
    else if ($("#locEntrega").val() == "" && $("#locEntrega2").val() == "") {
        if (valida == true) {
            $("#atabInformacoesIniciais").trigger("click");
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#locEntrega").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Local de Entrega não informado!";
        }
    }
    else if (valida == true) {

        if ($("#App").find(".orcamento").length < 1) {
            $("#atabItens").click();

            $([document.documentElement, document.body]).animate({
                scrollTop: $("#atabItens").offset().top - (screen.height * 0.1)
            }, 700);

            valida = "Nenhum orçamento encontrado!";
        }
        else {
            $("#App").find(".orcamento").each(function () {
                if ($(this).find(".selectFornecedor").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".selectFornecedor").find(".ant-select-selection-item").attr("title") == undefined) {
                    if (valida == true) {
                        $("#atabItens").trigger("click");
                        if ($(this).find(".panel-body").css("display") == "none") {
                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                        }
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.1)
                        }, 700);
                        valida = "Fornecedor não selecionado!";
                    }
                }
                else if ($(this).find(".selectCondicaoPagto").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".selectCondicaoPagto").find(".ant-select-selection-item").attr("title") == undefined) {
                    if (valida == true) {
                        $("#atabItens").trigger("click");
                        if ($(this).find(".panel-body").css("display") == "none") {
                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                        }
                        $([document.documentElement, document.body]).animate({
                            scrollTop: $(this).offset().top - (screen.height * 0.1)
                        }, 700);
                        valida = "Condição de Pagamento não selecionada!";
                    }
                }
                else {
                    $(this).find(".item").each(function () {
                        if ($(this).find(".DescricaoItem").val() == "") {
                            if (valida == true) {
                                $("#atabItens").trigger("click");

                                if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                    $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                }

                                if ($(this).find(".panel-body").css("display") == "none") {
                                    $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                }

                                $(this).find(".tab:first").trigger("click");


                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.1)
                                }, 700);

                                valida = "Descrição do Item não informada!";
                            }
                        }
                        else if ($(this).find(".QuantidadeItem").val() == "") {
                            if (valida == true) {
                                $("#atabItens").trigger("click");
                                if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                    $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                }
                                if ($(this).find(".panel-body").css("display") == "none") {
                                    $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                }
                                $(this).find(".tab:first").trigger("click");

                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.1)
                                }, 700);

                                valida = "Quantidade do Item não informada!";
                            }
                        }
                        else if ($(this).find(".ValorUnitItem").val() == "" || $(this).find(".ValorUnitItem").val() == "R$ 0,0000") {
                            if (valida == true) {
                                $("#atabItens").trigger("click");

                                if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                    $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                }

                                console.log($(this).closest(".orcamento").find(".panel-body:first").css("display"))
                                if ($(this).find(".panel-body").css("display") == "none") {
                                    $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                }
                                $(this).find(".tab:first").trigger("click");

                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.1)
                                }, 700);

                                valida = "Valor Unitário não informado!";
                            }
                        }
                        else if ($(this).find(".PrazoEntrega").val() == "") {
                            if (valida == true) {
                                $("#atabItens").trigger("click");

                                if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                    $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                }
                                if ($(this).find(".panel-body").css("display") == "none") {
                                    $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                }
                                $(this).find(".tab:first").trigger("click");

                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.1)
                                }, 700);

                                valida = "Prazo de Entrega não informado!";
                            }
                        }
                        else if ($(this).find(".RateioCCusto").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".RateioCCusto").find(".ant-select-selection-item").attr("title") == undefined) {
                            if (valida == true) {
                                $("#atabItens").trigger("click");

                                if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                    $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                }
                                if ($(this).find(".panel-body").css("display") == "none") {
                                    $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                }
                                $(this).find(".tab:last").trigger("click");


                                $([document.documentElement, document.body]).animate({
                                    scrollTop: $(this).offset().top - (screen.height * 0.1)
                                }, 700);

                                valida = "Rateio por Centro de Custo não selecionado!";
                            }
                        }
                        else {
                            var percentualTotal = 0;

                            if ($(this).find(".tableRateioDepartamento").find("tbody").find("tr").length < 1) {
                                if (valida == true) {
                                    $("#atabItens").trigger("click");

                                    if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                        $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                    }
                                    if ($(this).find(".panel-body").css("display") == "none") {
                                        $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                    }
                                    $(this).find(".tab:last").trigger("click");
                                    $([document.documentElement, document.body]).animate({
                                        scrollTop: $(this).offset().top - (screen.height * 0.1)
                                    }, 700);

                                    valida = "Nenhum Departamento inserido nos Rateios do Item!";
                                }
                            }

                            $(this).find(".tableRateioDepartamento").find("tbody").find("tr").each(function () {
                                if ($(this).find(".selectDepartamento").find(".ant-select-selection-item").attr("title") == "" || $(this).find(".selectDepartamento").find(".ant-select-selection-item").attr("title") == undefined) {
                                    if (valida == true) {
                                        $("#atabItens").trigger("click");

                                        if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                            $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                        }
                                        if ($(this).find(".panel-body").css("display") == "none") {
                                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                        }
                                        $(this).find(".tab:last").trigger("click");

                                        $([document.documentElement, document.body]).animate({
                                            scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                                        }, 700);

                                        valida = "Rateio por Departamento não selecionado!";
                                    }
                                }
                                else if ($(this).find(".Percentual").val() == "" || $(this).find(".Percentual").val() == "%") {
                                    if (valida == true) {
                                        $("#atabItens").trigger("click");

                                        if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                            $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                        }
                                        if ($(this).find(".panel-body").css("display") == "none") {
                                            $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                        }
                                        $(this).find(".tab:last").trigger("click");

                                        $([document.documentElement, document.body]).animate({
                                            scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                                        }, 700);

                                        valida = "Percentual do Rateio por Departamento não informado!";
                                    }
                                } else {
                                    percentualTotal += parseFloat($(this).find(".Percentual").val().split(",").join("."));
                                }
                            });

                            if (percentualTotal != 100) {
                                if (valida == true) {
                                    $("#atabItens").trigger("click");

                                    if ($(this).closest(".orcamento").find(".panel-body:first").css("display") == "none") {
                                        $(this).closest(".orcamento").find(".panel-heading:first").find(".detailsShow").trigger("click");
                                    }
                                    if ($(this).find(".panel-body").css("display") == "none") {
                                        $(this).find(".panel-heading").find(".detailsShow").trigger("click");
                                    }
                                    $(this).find(".tab:last").trigger("click");

                                    $([document.documentElement, document.body]).animate({
                                        scrollTop: $(this).closest(".item").offset().top - (screen.height * 0.1)
                                    }, 700);

                                    valida = "Percentual do Rateio por Departamento não atingiu 100%!";
                                }
                            }
                        }
                    });
                }
            });

            if ($("#App").find(".orcamento").length > 1) {
                if ($("#MapaCotacaoItens").val() == "") {
                    return "Orçamento não selecionado para o Item!";

                }
                var MapaCotacaoItens = JSON.parse($("#MapaCotacaoItens").val());

                MapaCotacaoItens.forEach(item => {
                    if (item.orcamento === '') {
                        valida = "Orçamento não selecionado para o Item!";
                    }
                });
            }
        }

        if ($("#JustificativaOrcamento").val() == "" && valida == true) {
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#JustificativaOrcamento").offset().top - (screen.height * 0.1)
            }, 700);
            valida = "Justificativa não informada!";
        }
    }

    if (valida == true) {
        var date = calendar.getDate()._d;
        var dia = date.getDate();
        dia = (dia.toString().length == 1 ? "0" + dia : dia);
        var mes = (date.getMonth() + 1);
        mes = (mes.toString().length == 1 ? "0" + mes : mes);
        var ano = date.getFullYear();
        date = dia + "/" + mes + "/" + ano;
        $("#dataEntrega").val(date);

        var orcamentos = JSON.parse($("#cotacoes").val());

        var movimentos = null;
        if (orcamentos.length > 1) {
            movimentos = orcamentos.map(({ itens, ...rest }) => ({
                itens: [],
                ...rest
            }));

            var MapaCotacaoItens = JSON.parse($("#MapaCotacaoItens").val());

            MapaCotacaoItens.forEach(item => {
                movimentos[item.orcamento].itens.push(orcamentos[item.orcamento].itens.find(obj => obj.ItemId == item.item));
            });


            for (var i = movimentos.length - 1; i >= 0; i--) {
                if (movimentos[i].itens.length == 0) {
                    movimentos.splice(i, 1);
                }
            }

        }
        else {
            movimentos = orcamentos;
        }

        $("#movimentos").val(JSON.stringify(movimentos));


        var mods = VerificaModificacoesNosItens();
    }

    return valida;
}

function VerificaSeUsuarioPermissaoGeral() {
    var ds = DatasetFactory.getDataset("colleagueGroup", ["colleagueId"], [
        DatasetFactory.createConstraint("colleagueId", $("#userCode").val(), $("#userCode").val(), ConstraintType.MUST),
        DatasetFactory.createConstraint("groupId", "Comprador", "Comprador", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("groupId", "Matriz", "Matriz", ConstraintType.SHOULD),
        DatasetFactory.createConstraint("groupId", "Administrador TI", "Administrador TI", ConstraintType.SHOULD)
    ], null);


    if (ds.values.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

function NotificaOrcamento() {
    var movimentos = JSON.parse($("#movimentos").val());

    var html = "<div style='margin:auto' width='70'>";

    html += "<div>";
    html += "<div align='center'>";
    html += "<b style='font-size: 25px'>Pedido de Compras Realizado e Enviado para Aprovação!!</b><br>";
    html += "<br/>";
    html += "</div>";

    html += "<div>";
    html += "<b>Coligada: </b><span>" + $("#coligada").val() + "</span><br />";
    html += "</div>";
    html += "<div>";
    html += "<b>Filial: </b><span>" + $("#filial").val() + "</span><br />";
    html += "</div>";
    html += "<div>";
    html += "<b>Local de Estoque: </b><span>" + $("#locEstoque").val().split(" - ")[1] + "</span><br />";
    html += "</div>";
    html += "<div>";
    html += "<b>Data de Entrega: </b><span>" + $("#dataEntrega").val() + "</span><br />";
    html += "</div>";

    html += "<div>";
    html += " <b>Valor Total: </b><span>" + FormataValorParaMoeda(CalculaTotalSolicitacao(), 2) + "</span><br />";
    html += "</div>";

    html += "<div>";
    html += " <b>Comprador: </b><span>" + $("#userCode").val() + "</span><br />";
    html += "</div>";

    html += "<div>";
    html += " <b>Solicitante: </b><span>" + $("#solicitante").val() + "</span><br />";
    html += "</div>";

    html += "</div>";

    html += "<div align='center'>";
    html += "<br />";
    html += "<img src='http://homologacao.castilho.com.br:2020/volume/stream/Rmx1aWc=/P3Q9MSZ2b2w9RGVmYXVsdCZpZD0yOTk5OSZ2ZXI9MTAwMCZmaWxlPVBlZGlkb1BlbmRlbnRlQXByb3ZhY2FvLnBuZyZjcmM9MTg1MTcwNTUwNiZzaXplPTAuMDQ4NTE2JnVJZD00MCZmU0lkPTEmdVNJZD0xJmQ9ZmFsc2UmdGtuPSZwdWJsaWNVcmw9ZmFsc2U=.png' width='auto'  height='120'>";
    html += "<br />";
    html += "</div>";

    for (var i = 0; i < movimentos.length; i++) {
        var movimento = movimentos[i];
        var fornecedor = movimento.fornecedor.split("___");
        fornecedor = fornecedor[2] + " - " + fornecedor[3];

        html += '<div style="font-size: 14px; font-family: Calibri; border: 1px solid black; padding: 8px 10px; height:90%">';
        html += '<h3 style="margin-top: 0px; margin-bottom: 8px">' + fornecedor + '</h3>';
        html += '<div>';
        html += '<b>Condição de Pagamento: </b>';
        html += '<span>' + movimento.condicaoPagamento.split("___")[1] + '</span>';
        html += '</div>';

        html += '<h3 style="margin-bottom: 5px">Itens</h3>';

        for (var j = 0; j < movimento.itens.length; j++) {
            var item = movimento.itens[j];

            html += '<div style="">';
            html += '<div style="border: 1px solid black; width: calc(100% - 40px); margin-bottom: 20px;">';
            html += '<div style="background-color: smokewhite; padding: 8px 10px;">';
            html += '<h3 style="margin: 0px;">Item ' + (j + 1) + '</h3>';
            html += '</div>';

            html += '<div style="padding-left: 8px; padding-right: 8px; padding-top: 10px; padding-bottom: 10px;">';
            html += '<div>';
            html += '<b>Produto: </b><span>' + item.ProdutoItem + '</span><br />';
            html += '</div>';

            html += '<div>';
            html += '<b>Descrição: </b><span>' + item.DescricaoItem + '</span><br />';
            html += '</div>';

            html += '<div>';
            html += '<b>Valor: </b><span>' + FormataValorParaMoeda(item.QuantidadeItem * item.ValorUnitItem, 2) + '</span><br />';
            html += '</div>';
            html += '</div>';
            html += "</div>";
            html += '</div>';
        }
        html += '</div>';
    }
    html += "Para mais detalhes, <a href='http://fluig.castilho.com.br:1010/portal/p/1/pageworkflowview?app_ecm_workflowview_detailsProcessInstanceID=" + $("#numProcess").val() + "'>clique aqui</a> ou verifique as informações adicionais nos campos complementares no RM.<br><br>";

    html += '</div>';


    var data = {
        "to": BuscaEmailUsuario($("#userComprador").val()) + "; " + ($("#solicitante").val() != $("#userComprador").val() ? BuscaEmailUsuario($("#solicitante").val()) : ""),//Prod
        // "to": "gabriel.persike@castilho.com.br",//Homolog
        "from": "fluig@construtoracastilho.com.br", //Prod
        // "from": "no-reply@construtoracastilho.com.br", //Homolog
        "subject": "Fluig - Pedido de Compras Realizado", //   subject
        "templateId": "TPL_NOTIFICACAO_OC", // Email template Id previously registered
        "dialectId": "pt_BR", //Email dialect , if not informed receives pt_BR , email dialect ("pt_BR", "en_US", "es")
        "param": { "CORPO_EMAIL": html } //  Map with variables to be replaced in the template
    };

    $.ajax({
        url: "/api/public/alert/customEmailSender",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data)
    });
}

function VerificaModificacoesNosItens() {
    var itens = JSON.parse($("#itens").val());
    var orcamentos = JSON.parse($("#cotacoes").val());
    var modificacoesItens = [];

    for (var item of itens) {
        var itemModificado = {
            ItemId: item.ItemId
        }

        var found = null;


        for (let i = 0; (i < orcamentos.length && found == null); i++) {
            const orcamento = orcamentos[i];
            var found = orcamento.itens.find(obj => obj.ItemId == item.ItemId);
        }

        if (found) {
            if (found.DescricaoItem != item.DescricaoItem) {
                itemModificado.DescricaoItem = found.DescricaoItem;
                item.DescricaoItem = found.DescricaoItem;
            }

            if (found.QuantidadeItem != item.QuantidadeItem) {
                itemModificado.QuantidadeItem = found.QuantidadeItem;
                item.QuantidadeItem = found.QuantidadeItem;
            }
        }
        else {
            itemModificado.removido = true;
            const index = itens.indexOf(item);
            itens.splice(index, 1);
        }

        if (Object.keys(itemModificado).length > 1) {
            modificacoesItens.push(itemModificado);
        }
    }

    $("#itens").val(JSON.stringify(itens));
    return modificacoesItens;
}

function BuscaComprador(comprador, locEstoque) {
    return new Promise((resolve, reject) => {
        if (comprador == "Matriz") {
            $("#userComprador").val("Pool:Group:Comprador");
            resolve();
        }
        else if(comprador == "Controladoria"){
            $("#userComprador").val("Pool:Group:Controladoria");
            resolve();
        }
        else if(comprador == "Obra" && (locEstoque == "Obra VLI Planalto" || locEstoque == "Obra VLI Paulista")){
            $("#userComprador").val("alexandre.junior");
            resolve();
        }  
        else if(comprador == "Obra" && locEstoque == "Obra Emergência Santa Maria"){
            $("#userComprador").val("marcio.protoba");
            resolve();
        }
        else if (comprador == "Obra" && locEstoque != "Obra VLI Planalto" && locEstoque != "Obra VLI Paulista" && locEstoque != "Obra Emergência Santa Maria") {
            $.getJSON("//fluig.castilho.com.br:1010/portal/api/rest/wcm/service/group/findGroupDataByCode?groupCode=" + locEstoque.split(" ").join("+"), function (dados) {//Prod
            //    $.getJSON("//homologacao.castilho.com.br:2020/portal/api/rest/wcm/service/group/findGroupDataByCode?groupCode=" + locEstoque.split(" ").join("+"), function (dados) {//Homolog
                var userComprador = null;

                if (dados.content && dados.message == null) {
                    dados.content.forEach(dado => {
                        if (dado.key == "Comprador") {
                            userComprador = dado.value;
                        }
                    });
                }
               
                if (userComprador) {
                    $("#userComprador").val(userComprador);
                    resolve();
                }
                else {
                    $("#userComprador").val("");
                    $("#comprador").val("");
                    alert("Comprador não encontrado para o Local de Estoque selecionado!");
                    reject();
                }
            });
        }        
        else {
            $("#userComprador").val("");
            resolve()
        }
    });
}

function VerificaSePodeIncluirOProdutoSelecionado(IDPRD, produtoDesc){
    var validaPorTipoDeMovimento = validaSeProdutoPermitidoNoTipoDeMovimento(IDPRD, produtoDesc);
    if (validaPorTipoDeMovimento !== true) {
        return validaPorTipoDeMovimento;
    }

    var validaPorUsuario = validaSeUsuarioTemPermissaoNoProduto(IDPRD, produtoDesc);
    if (validaPorUsuario !== true) {
        return validaPorUsuario;
    }

    return true;
}

function validaSeUsuarioTemPermissaoNoProduto(IDPRD, produtoDesc) {
    if (IDPRD == '4391' || IDPRD == '153' || IDPRD == '878') {// Multas de Trânsito e Multas (Coligadas 1 e 2)
        if (!validaGrupo($("#userCode").val(), ["Comprador", "Central Sul"])) {//Verifica se o usuario tem permissao para usar o produto
            return "Para solicitações de Multas, por favor entre em contato com a Matriz e/ou a Central de Equipamentos.";
        }
    } else {

        var produtosMatriz = DatasetFactory.getDataset("BuscaProdutosMatriz", null, [], null).values;

        var found = produtosMatriz.find(obj => obj.IDPRD == IDPRD)
        if (found) {
            // Produtos usados somente pelo Compras Matriz
            if (!validaGrupo($("#userCode").val(), ["Comprador"])) {//Verifica se o usuario tem permissao para usar o produto
                return "Produto " + produtoDesc + " disponível somente para o Compras Matriz";
            }
        }
    }

    return true;
}

function validaSeProdutoPermitidoNoTipoDeMovimento(IDPRD, produtoDesc){
    var codtmv = $("#codtmv").val().split(" - ")[0];

    if (codtmv == "1.1.02") {
        return true;
        //Itens bloqueados para OC são bloqueados na Query, por isso não é necessário executar a função
        //caso um dia ocorra será necessário implementar a função
        //return validaSeProdutoPermitidoEmOC(IDPRD, produtoDesc);
    }
    else if (codtmv == "1.1.07") {
        return validaSeProdutoPermitidoEmOS(IDPRD, produtoDesc);
    }
    else if (codtmv == "1.1.10") {
        return true;
        //Itens bloqueados para CT-e são bloqueados na Query, por isso não é necessário executar a função
        //caso um dia ocorra será necessário implementar a função
        //return validaSeProdutoPermitidoEmOC(IDPRD, produtoDesc);
        //return validaSeProdutoPermitidoEmCTe(IDPRD, produtoDesc);
    }
}

function validaSeProdutoPermitidoEmOS(IDPRD, produtoDesc){
    var GrupoImobilizado = "10.002";

    // 10.002.90020	Caçamba Ferroviaria (Imob.)
    if (produtoDesc.substring(0, 6) == GrupoImobilizado && produtoDesc.substring(0, 12) != '10.002.90020') {
        return "Produto do tipo Imobilizado não é permitido em Ordem de Serviço!";
    }

    return true;    
}

function validaGrupo(usuario, grupos) {//Verifica se o usuario faz parte dos grupos
    var constraints = [DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)];
    for (var i = 0; i < grupos.length; i++) {
        constraints.push(DatasetFactory.createConstraint("groupId", grupos[i], grupos[i], ConstraintType.SHOULD));
    }

    var ds = DatasetFactory.getDataset("colleagueGroup", null, constraints, null);

    if (ds.values.length > 0) {
        return ds.values[0]["colleagueGroupPK.groupId"];
    } else {
        return false;
    }
}

function BuscaEmailUsuario(usuario) {
    if (usuario == "alysson.silva") {
        usuario = "alysson.silva1";
    }

    var ds = DatasetFactory.getDataset("colleague", null, [DatasetFactory.createConstraint("colleagueId", usuario, usuario, ConstraintType.MUST)], null);

    if (ds.values.length > 0) {
        return ds.values[0]["mail"] + "; ";
    }
    else {
        return "";
    }
}

function VerificaSeLocalDeEstoqueTemREIDI(locEstoque) {
    if (locEstoque == "Obra Conserva Echaporã" || locEstoque == "Obra Duplicação Oriente" || locEstoque == "Obra Parapuã" || locEstoque == "Obra COFCO" || 
    		locEstoque == "Obra Paraguaçu Paulista" || locEstoque == "Obra Conserva Maracaí" || locEstoque == "Obra MRS Pátios Vale do Paraíba") {
        return true;
    }
    else {
        return false;
    }
}

function buscaNatureza(filial) {
    var retorno = DatasetFactory.getDataset("CODNATUREZA", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", 2, 2, ConstraintType.MUST),
        DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODFILIAL", filial, filial, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODNAT", '1.252.01', '1.252.01', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '1.556.01', '1.556.01', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '2.556.01', '2.556.01', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '2.101.01', '2.101.01', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '2.252.01', '2.252.01', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '1.949.99', '1.949.99', ConstraintType.SHOULD),
        DatasetFactory.createConstraint("CODNAT", '2.949.99', '2.949.99', ConstraintType.SHOULD)
    ], ["CODNAT"]);

    if (!retorno || retorno == "" || retorno == null) {
        console.log("FALHA CODNATUREZA = " + retorno);
        throw "Houve um erro na comunicação com o banco de dados. Tente novamente!";
    }
    else {
        return retorno.values;
    }
}

function BuscaMovimentoRM(CODCOLIGADA, IDMOV, SISMA = false) {

    var dataset = DatasetFactory.getDataset("ConsultaMovimentoRM", null, [
        DatasetFactory.createConstraint("pIdmov", IDMOV, IDMOV, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("pSismaRM", SISMA, SISMA, ConstraintType.MUST)

    ], null);

    return dataset.values
}

function BuscaItensMovimentoRM(CODCOLGIGADA, IDMOV, SISMA = false) {
    var dataset = DatasetFactory.getDataset("ConsultaMovimentoItemRM", null, [
        DatasetFactory.createConstraint("pIdmov", IDMOV, IDMOV, ConstraintType.MUST),
        DatasetFactory.createConstraint("pCodcoligada", CODCOLGIGADA, CODCOLGIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("pSismaRM", SISMA, SISMA, ConstraintType.MUST)
    ], null);

    return dataset.values;
}

function GeraOCSISMA() {
    /*var coligada = $("#coligada").val();
    $("#coligada").html("");
    BuscaColigadas().then(() => {
        $("#coligada").find("option").each(function () {
            if ($(this).val().split(" - ")[0] == coligada) {
                $("#coligada").val($(this).val());
            }
        });

        $("#codtmv").val("1.1.02 - Ordem de Compra");

        $("#coligada").siblings("div").text($("#coligada").find(":selected").text());
        $("#codtmv").siblings("div").text($("#codtmv").val());
        var MovimentoRM = BuscaMovimentoRM($("#coligada").val().split(" - ")[0], $("#idOrigemRM").val(), true);
        var ItensRM = BuscaItensMovimentoRM($("#coligada").val().split(" - ")[0], $("#idOrigemRM").val(), true);

        $("#filial").val(MovimentoRM[0].codFilial);
        $("#condicaoPgto").val(MovimentoRM[0].condicaoPgto);
        $("#formaPgto").val(MovimentoRM[0].formaPgto);
        $("#locEntrega2").val(MovimentoRM[0].locEntrega2);
        $("#locEstoque").val(MovimentoRM[0].localEstoque);

        if (MovimentoRM[0].obraOuMatriz == 1) {
            $("#comprador").val("Obra");
            $("#userComprador").val(MovimentoRM[0].obraOuMatriz);
        } else {
            $("#comprador").val("Matriz");
            $("#userComprador").val("Poll:Group:Comprador")
        }

        $("#dataEntrega").val(MovimentoRM[0].przData);
        $("#solicitante").val(MovimentoRM[0].solicitante);


        var Itens = [];

        for (const Item of ItensRM) {
            var ccusto = BuscaCCUSTOPorCodigo($("#coligada").val().split(" - ")[0], Item.ccustoRat);
            var depto = BuscaDEPTOPorCodigo($("#coligada").val().split(" - ")[0], $("#filial").val().split(" - ")[0], Item.dpRat)

            Itens.push({
                ProdutoItem: Item.codigoPRD + " - " + Item.codPrdCC,
                IdPrdItem: Item.idprd,
                CodPrdItem: Item.codigoPRD,
                DescPrdItem: Item.codPrdCC,
                DescricaoItem: Item.descricaoPRD,
                QuantidadeItem: Item.prdQtd,
                CODTB1FAT: Item.CODTB1FAT,
                ValorUnitItem: "0." + "00000000".substring(0, Item.decimais),
                CodUndItem: Item.prdMed,
                QntdDecimaisPrdItem: Item.decimais,
                PrazoEntrega: "",
                SubEmpreiteiro: false,
                SubEmpreiteiroSelect: "",
                SubEmpreiteiroObservacao: "",
                RateioCCusto: ccusto.CODCCUSTO + " - " + ccusto.NOME,
                RateioDepto: [
                    {
                        Departamento:depto.CODDEPARTAMENTO + " - " + depto.NOME,
                        Valor: "0.0000",
                        Percentual: "100"
                    }
                ]
            });
        }

        $("#itens").val(JSON.stringify(Itens));
        CarregaInfosAprov();
        Promise.all([
            BuscaFilial(),
            BuscaCondicaoDePagamento(),
            BuscaFormaDePagamento(),
            BuscaTransporte(),
            BuscaLocalDeEntrega()
        ]).then(results => {
            ReactDOM.render(React.createElement(OrcamentoRoot, { listCondicaoPagamento: results[1] }), document.querySelector('#App'));
            ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: results[0], listCondicaoPagamento: results[1], listFormaPagamento: results[2], listTransporte: results[3], listLocalEntrega: results[4] }), document.querySelector('#tabInformacoesIniciais'));
        });
    }); */
	
	var coligada = $("#coligada").val();
    $("#coligada").html("");
    BuscaColigadas().then(() => {
        $("#coligada").find("option").each(function () {
            if ($(this).val().split(" - ")[0] == coligada) {
                $("#coligada").val($(this).val());
            }
        });              

        $("#coligada").siblings("div").text($("#coligada").find(":selected").text());
        // $("#tpmov").siblings("div").text($("#tpmov").val());
        let selectElement = document.getElementById('codtmv');

            // Remove opções duplicadas
            let options = Array.from(selectElement.options);
            let uniqueOptions = [];

            options.forEach(option => {
            let exists = uniqueOptions.some(uniqueOption => uniqueOption.value === option.value);
            if (!exists) {
                uniqueOptions.push(option);
            }
            });

            // Remove todas as opções atuais
            selectElement.innerHTML = "";

            // Adiciona as opções únicas de volta ao dropdown
            uniqueOptions.forEach(option => {
            selectElement.add(option);
            });

            // Verifica se algum dos valores obrigatórios foi removido e adiciona de volta
            let requiredOptions = [
            { value: '1.1.02 - Ordem de Compra', text: '1.1.02 - Ordem de Compra' },
            { value: '1.1.07 - Ordem de Serviço', text: '1.1.07 - Ordem de Serviço' },
            { value: '1.1.10 - Ordem de Transporte CTe', text: '1.1.10 - Ordem de Transporte CTe' }
            ];

            requiredOptions.forEach(required => {
            let exists = uniqueOptions.some(option => option.value === required.value);
            if (!exists) {
                let newOption = new Option(required.text, required.value);
                selectElement.add(newOption);
            }
            });
        var MovimentoRM = BuscaMovimentoRM($("#coligada").val().split(" - ")[0], $("#idOrigemRM").val(), true);
        var ItensRM = BuscaItensMovimentoRM($("#coligada").val().split(" - ")[0], $("#idOrigemRM").val(), true);

        $("#filial").val(MovimentoRM[0].codFilial);
        $("#condicaoPgto").val(MovimentoRM[0].condicaoPgto);
        $("#formaPgto").val(MovimentoRM[0].formaPgto);
        $("#locEntrega2").val(MovimentoRM[0].locEntrega2);
        $("#locEstoque").val(MovimentoRM[0].localEstoque);

        if (MovimentoRM[0].obraOuMatriz == 1) {
            $("#comprador").val("Obra");
            $("#userComprador").val(MovimentoRM[0].obraOuMatriz);
        } else {
            $("#comprador").val("Matriz");
            $("#userComprador").val("Poll:Group:Comprador")
        }

        $("#dataEntrega").val(MovimentoRM[0].przData);
        $("#solicitante").val(MovimentoRM[0].solicitante);


        var Itens = [];

        for (const Item of ItensRM) {
            var ccusto = BuscaCCUSTOPorCodigo($("#coligada").val().split(" - ")[0], Item.ccustoRat);
            var depto = BuscaDEPTOPorCodigo($("#coligada").val().split(" - ")[0], $("#filial").val().split(" - ")[0], Item.dpRat)

            Itens.push({
                ProdutoItem: Item.codigoPRD + " - " + Item.codPrdCC,
                IdPrdItem: Item.idprd,
                CodPrdItem: Item.codigoPRD,
                DescPrdItem: Item.codPrdCC,
                DescricaoItem: Item.descricaoPRD,
                QuantidadeItem: Item.prdQtd,
                CODTB1FAT: Item.CODTB1FAT,
                ValorUnitItem: "0." + "00000000".substring(0, Item.decimais),
                CodUndItem: Item.prdMed,
                QntdDecimaisPrdItem: Item.decimais,
                PrazoEntrega: "",
                SubEmpreiteiro: false,
                objOfficina: Item.objOfficina,
                SubEmpreiteiroSelect: "",
                SubEmpreiteiroObservacao: "",
                RateioCCusto: ccusto.CODCCUSTO + " - " + ccusto.NOME,
                RateioDepto: [
                    {
                        Departamento:depto.CODDEPARTAMENTO + " - " + depto.NOME,
                        Valor: "0.0000",
                        Percentual: "100"
                    }
                ]
            });
        }

        $("#itens").val(JSON.stringify(Itens));
        CarregaInfosAprov();
        Promise.all([
            BuscaFilial(),
            BuscaCondicaoDePagamento(),
            BuscaFormaDePagamento(),
            BuscaTransporte(),
            BuscaLocalDeEntrega()
        ]).then(results => {
            ReactDOM.render(React.createElement(OrcamentoRoot, { listCondicaoPagamento: results[1] }), document.querySelector('#App'));
            ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: results[0], listCondicaoPagamento: results[1], listFormaPagamento: results[2], listTransporte: results[3], listLocalEntrega: results[4] }), document.querySelector('#tabInformacoesIniciais'));
        });
    });
	
}

function BuscaCCUSTOPorCodigo(CODCOLIGADA, CODCCUSTO){
    var ds = DatasetFactory.getDataset("GCCUSTO", null, [
        DatasetFactory.createConstraint("CODCCUSTO", CODCCUSTO, CODCCUSTO, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST)
    ], null);

    return ds.values[0];
}

function BuscaDEPTOPorCodigo(CODCOLIGADA, CODFILIAL, CODDEPARTAMENTO){
    var ds = DatasetFactory.getDataset("GDEPTO", null, [
        DatasetFactory.createConstraint("CODCOLIGADA", CODCOLIGADA, CODCOLIGADA, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODFILIAL", CODFILIAL, CODFILIAL, ConstraintType.MUST),
        DatasetFactory.createConstraint("CODDEPARTAMENTO", CODDEPARTAMENTO, CODDEPARTAMENTO, ConstraintType.MUST)
    ], null);

    return ds.values[0];
}