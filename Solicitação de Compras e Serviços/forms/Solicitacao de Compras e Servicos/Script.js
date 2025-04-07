let rootReact = null;
let ReactHolder = null;
let onincluirItem = null;

$(document).ready(function () {
    console.clear();
    if ($("#formMode").val() == "ADD") {
        $("#divListaProdutos, #btnReturnItens, #btnAdicionarCotacao, #divCollapse, #divInfoSolicitacaoAprov, #divJustificativa").hide();
        $("#codtmv").closest(".form-input").hide();
        $("#atabMapaCotacao, #atabResumo").closest("li").hide();
        $("#divRateioIncluirItem").find(".panel-body").hide();
        BuscaColigadas();
    }
    else if ($("#formMode").val() == "MOD") {
        if ($("#atividade").val() == 4) {//Inicio
            $("#atabResumo, #atabMapaCotacao").closest("li").hide();
            $("#btnAdicionarCotacao, #divDecisao, #divListaProdutos, #btnReturnItens, #divInfoSolicitacaoAprov, #divJustificativa").hide();
            $("#codtmv").closest(".form-input").show();
            $("#divCollapse").show();

            setTimeout(() => {
                //Timeout realizado para enviar o código pro final do Runtime
                //Assim garantindo que as Classes serao ultilizadas somente depois de criadas
                //Fora do Timeout pode ocorrer, dependendo do tempo de execucao do JS retornar Classe undefined

                Promise.all([
                    BuscaFilial(),
                    BuscaCondicaoDePagamento(),
                    BuscaFormaDePagamento(),
                    BuscaTransporte(),
                    BuscaLocalDeEntrega()
                ]).then(results => {
                    //Renderiza a Aba de Informacoes Inciais
                    ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: results[0], listCondicaoPagamento: results[1], listFormaPagamento: results[2], listTransporte: results[3], listLocalEntrega: results[4] }), document.querySelector('#tabInformacoesIniciais'));
                });
                DatasetFactory.getDataset("DepartamentosRM", null, [DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST), DatasetFactory.createConstraint("codfilial", $("#filial").val().split(" - ")[0], $("#filial").val().split(" - ")[0], ConstraintType.MUST)], null, {
                    success: (ds) => {
                        var retorno = [];
                        ds.values.forEach((departamento) => {
                            retorno.push({
                                value: departamento.coddepartamento + " - " + departamento.nome,
                                label: departamento.coddepartamento + " - " + departamento.nome
                            });
                        });


                        ReactDOM.render(React.createElement(AppRoot, { listDepto: retorno }), document.querySelector('#App'));
                    },
                    error: (error) => {
                        FLUIGC.toast({
                            title: "Erro ao buscar Departamentos: ",
                            message: error,
                            type: "warning"
                        });
                    },
                });
            }, 250);
        }
        else if ($("#atividade").val() == 5) {//Orçamento


            $("#divListaProdutos, #divListaItens, #btnReturnItens, #btnAdicionarItem").hide();
            $("#atabResumo").closest("li").hide();

            var cotacoes = $("#cotacoes").val();
            if (cotacoes == "" || JSON.parse(cotacoes).length < 2) {
                $("#atabMapaCotacao").closest("li").hide();
            }
            else {
                $("#atabMapaCotacao").closest("li").show();
            }

            setTimeout(() => {
                CarregaInfosAprov();
                Promise.all([
                    BuscaFilial(),
                    BuscaCondicaoDePagamento(),
                    BuscaFormaDePagamento(),
                    BuscaTransporte(),
                    BuscaLocalDeEntrega()
                ]).then(results => {
                    console.log(results);
                    ReactDOM.render(React.createElement(ResumoOrcamento), document.querySelector('#ResumoOrcamento'));

                    ReactDOM.render(React.createElement(OrcamentoRoot, { listCondicaoPagamento: results[1] }), document.querySelector('#App'));
                    ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: results[0], listCondicaoPagamento: results[1], listFormaPagamento: results[2], listTransporte: results[3], listLocalEntrega: results[4] }), document.querySelector('#tabInformacoesIniciais'));
                });
            }, 250);


            if ($("#idOrigemRM").val() != "" && $("#itens").val() == "") {
                //Se o campo #idOrigemRM estiver preenchido, entao busca o movimento o movimento do RM para gerar a OC
                //Mas se o campo #itens já estiver preenchido significa que a OC ja foi gerada outra vez entao nao busca a OC para nao sobreescrever a solicitacao
                GeraOCSISMA();
            }

            $("#coligada, #codtmv").hide();
            $("#coligada").siblings("div").text($("#coligada").find(":selected").text());
            $("#codtmv").siblings("div").text($("#codtmv").val());
        }
        else if ($("#atividade").val() == 11 || $("#atividade").val() == 12 || $("#atividade").val() == 13 || $("#atividade").val() == 14) {//Aprov Eng
            $("#JustificativaOrcamento").attr("readonly", "readonly");
            $("#divInfoSolicitacao").hide();
            $("#atabResumo").click();
            $("#atabInformacoesIniciais, #atabItens").closest("li").hide();
            if (JSON.parse($("#cotacoes").val()).length < 2) {
                $("#atabMapaCotacao").closest("li").hide();
            }
            setTimeout(() => {
                CarregaInfosAprov();

                ReactDOM.render(React.createElement(ResumoOrcamento), document.querySelector('#ResumoOrcamento'));
                ReactDOM.render(React.createElement(AprovacaoRoot), document.querySelector('#tabResumo'));
            }, 500);
        }

    }
    else if ($("#formMode").val() == "VIEW") {
        $("#divDecisao").hide();
        if ($("#atividade").val() == "4" || $("#atividade").val() == "5") {//Caso ainda esteja em cotacao
            $("#atabMapaCotacao, #atabResumo").closest("li").hide();
            setTimeout(() => {
                //Timeout realizado para enviar o código pro final do Runtime
                //Assim garantindo que as Classes serao ultilizadas somente depois de criadas
                //Fora do Timeout pode ocorrer, dependendo do tempo de execucao, do JS retornar Classe undefined
                DatasetFactory.getDataset("DepartamentosRM", null, [DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST), DatasetFactory.createConstraint("codfilial", $("#filial").val().split(" - ")[0], $("#filial").val().split(" - ")[0], ConstraintType.MUST)], null, {
                    success: (ds) => {
                        var retorno = [];
                        ds.values.forEach((departamento) => {
                            retorno.push({
                                value: departamento.coddepartamento + " - " + departamento.nome,
                                label: departamento.coddepartamento + " - " + departamento.nome
                            });
                        });

                        ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: [], listCondicaoPagamento: [], listFormaPagamento: [], listTransporte: [], listLocalEntrega: [] }), document.querySelector('#tabInformacoesIniciais'));
                        ReactDOM.render(React.createElement(AppRoot, { listDepto: retorno }), document.querySelector('#App'));
                    },
                    error: (error) => {
                        FLUIGC.toast({
                            title: "Erro ao buscar Departamentos: ",
                            message: error,
                            type: "warning"
                        });
                    },
                });

            }, 500);
        } else {//Caso esteja para aprovacao
            $("#atabItens, #atabMapaCotacao").closest("li").hide();
            $("#atabResumo").click();
            setTimeout(() => {
                ReactDOM.render(React.createElement(ResumoOrcamento), document.querySelector('#ResumoOrcamento'));
                ReactDOM.render(React.createElement(AprovacaoRoot), document.querySelector('#tabResumo'));
                ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: [], listCondicaoPagamento: [], listFormaPagamento: [], listTransporte: [], listLocalEntrega: [] }), document.querySelector('#tabInformacoesIniciais'));
            }, 500);
        }
    }

    $("#coligada, #codtmv").on("change", function () {
        if ($("#coligada").val() == "") {
            ReactDOM.unmountComponentAtNode(document.querySelector('#App'));
            ReactDOM.unmountComponentAtNode(document.querySelector('#tabInformacoesIniciais'));
            $("#divCollapse").hide();

            $("#natureza, #REIDI, #locEntrega2, #locEntrega, #codTransporte, #condicaoPgto, #dataEntrega, #comprador, #locEstoque, #filial").val("");
            $("#formaPgto").val("009 - Depósito C/C");
        }
        else if ($("#codtmv").val() == "") {
            $("#divCollapse").hide();
            $("#codtmv").closest(".form-input").show();
        }
        else if($("#coligada").val() != "1 - CONSTRUTORA CASTILHO" && $("#coligada").val() != "12 - DROMOS INFRA" && $("#codtmv").val() == "1.1.10 - Ordem de Transporte CTe"){
            $("#divCollapse").hide();
            $("#codtmv").val("");
            FLUIGC.toast({
                title:"Tipo de Movimento somente permitido para a Coligada 1",
                message:"",
                type:"warning"
            });
        }
        else {
            if ($(this).attr("id") == "coligada") {
                ReactDOM.unmountComponentAtNode(document.querySelector('#App'));
                ReactDOM.unmountComponentAtNode(document.querySelector('#tabInformacoesIniciais'));

                $("#natureza, #REIDI, #locEntrega2, #locEntrega, #codTransporte, #condicaoPgto, #dataEntrega, #comprador, #locEstoque, #filial").val("");
                $("#formaPgto").val("009 - Depósito C/C");
                $("#itens").val("");
            }
            else {
                buscaProdutos().then((produtos) => {
                    dataTableNovoItem.clear().draw();
                    dataTableNovoItem.rows.add(produtos.values);
                    setTimeout(() => {
                        dataTableNovoItem.columns.adjust().draw(); //Redraw the DataTable
                    }, 500);
                });
            }
            //Renderiza o Componente logo quando o usuario seleciona a Coligada (Neste momento sem as informacoes de Filial, Condicoes de Pagamento....)
            ReactDOM.render(React.createElement(InformacoesIniciaisRoot), document.querySelector('#tabInformacoesIniciais'));

            Promise.all([//Busca as informacoes da coligada selecionada
                BuscaFilial(),
                BuscaCondicaoDePagamento(),
                BuscaFormaDePagamento(),
                BuscaTransporte(),
                BuscaLocalDeEntrega()
            ]).then(results => {
                //Apos as informacoes serem carregadas renderiza o Componente novamente passando as informacoes como Prop
                ReactDOM.render(React.createElement(InformacoesIniciaisRoot, { listFiliais: results[0], listCondicaoPagamento: results[1], listFormaPagamento: results[2], listTransporte: results[3], listLocalEntrega: results[4] }), document.querySelector('#tabInformacoesIniciais'));
            });

            $("#codtmv").closest(".form-input").show();
            $("#divCollapse").show();
        }
    });

    $("#atabMapaCotacao").on("click", function () {
        ReactDOM.render(React.createElement(MapaDeCotacao, { orcamentos: JSON.parse($("#cotacoes").val()) }), document.querySelector('#divMapaCotacao'));
    });

    $("#cotacoes").on("change", function () {
        ReactDOM.render(React.createElement(ResumoOrcamento), document.querySelector('#ResumoOrcamento'));
    });

    $("input[name='decisao']").prop("checked", false);

    String.prototype.extenso = function (c) {
        var ex = [
            ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"],
            ["Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"],
            ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"],
            ["Mil", "Milhão", "Bilhão", "Trilhão", "Quadrilhão", "Quintilhão", "Sextilhão", "Setilhão", "Octilhão", "Nonilhão", "Decilhão", "Undecilhão", "Dodecilhão", "Tredecilhão", "Quatrodecilhão", "Quindecilhão", "Sedecilhão", "Septendecilhão", "Octencilhão", "Nonencilhão"]
        ];

        var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "Real", d = "Centavo", sl;
        for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
            j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
            if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
            for (a = -1, l = v.length; ++a < l; t = "") {
                if (!(i = v[a] * 1)) continue;
                i % 100 < 20 && (t += ex[0][i % 100]) ||
                    i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
                s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                    ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
            }
            a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
            a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
        }
        return r.join(e);
    }
});