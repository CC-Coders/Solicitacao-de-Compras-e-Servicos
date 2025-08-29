const useState = React.useState;
const useEffect = React.useEffect;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.log(error, errorInfo);
        FLUIGC.toast({
            message: errorInfo,
            type: "danger"
        });
        FLUIGC.toast({
            message: error,
            type: "danger"
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}

class InputPrefix extends React.Component {
    //Componente usado para a quantidade do item
    //Controla o input para preenchimento somente de numericos e tambem coloca depois do input o sufixo da UNIDADE DE MEDIDA (UN, L, KG, ) do produto selecionado
    handleChange(e) {
        const newValue = e.target.value.split(".").join("");
        const isValid = /^[0-9,]*$/.test(newValue);
        if (isValid) {
            e.target.value = this.unformatValue(e.target.value);
            this.props.onChange(e);
        }
    }

    unformatValue(value) {
        value = value.toString();
        value = value.split(".").join("").split(",");
        return value[0].replace(/[^0-9]/g, "") + (value[1] != undefined ? "." + value[1].replace(/[^0-9]/g, "") : "");
    }

    formatValue(value) {
        value = value.split(".");
        var int = value[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        var decimais = value[1] != undefined ? "," + value[1] : "";

        return int + decimais;
    }

    render() {
        return (
            <div className="with-suffix" suffix={this.props.CodUndItem}>
                <input
                    type="text"
                    className={"form-control " + this.props.className}
                    name={this.props.name}
                    value={this.formatValue(this.props.value)}
                    onChange={(e) => this.handleChange(e)}
                    readOnly={this.props.readOnly}
                />
            </div>
        );
    }
}

class ItemSisma extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            detailsIsShown: true,
            RateioCCusto: "",
            RateioDepto: []
        };
    }

    componentDidMount() {
        const dataItensSismaElement = document.getElementById('dataItensSisma');
        
        if (dataItensSismaElement && dataItensSismaElement.value) {
          const dataItensSisma = JSON.parse(dataItensSismaElement.value);
      
          if (dataItensSisma.length > 0) {
            const itemSisma = dataItensSisma[0];
      
            this.setState({
              item: {
                ProdutoItem: `${itemSisma.codigoPRD} ${itemSisma.nomeFantasiaPrd}`,
                DescricaoItem: itemSisma.descricaoPRD,
                QuantidadeItem: itemSisma.prdQtd,
                CentroDeCusto: itemSisma.ccustoRat,
                PorcentagemRateioCCusto: itemSisma.percentRatCCusto,
                PorcentagemRateioDepartamento: itemSisma.percentRatDep,
                DepartamentoRateio: itemSisma.dpRat,
                objOfficina: itemSisma.objOfficina
              },
            });
          }
        }
      }

    render() {
        const { item } = this.state;
        var id = makeid(4);
        return (
            <div className="item">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div>
                            <div style={{ float: "left" }}>
                                <div
                                    className={"details " + (this.state.detailsIsShown == true ? "detailsHide" : "detailsShow")}
                                    onClick={(e) => {
                                        this.handleClickDetails(e);
                                    }}
                                ></div>
                                <h3 className="panel-title countItem" style={{ marginRight: "10px" }}>
                                    Item {this.props.countItem + 1}
                                </h3>
                            </div>
                            <div style={{ display: "grid" }}>
                                <div className="row">
                                    <div className="col-lg-4 col-md-12">
                                        <div className="details"></div>
                                        <b>Descrição: </b>
                                        <span>{this.props.item.DescricaoItem}</span>
                                    </div>
                                    <div className="col-lg-8">
                                        <div className="row">
                                            <div className="col-lg-3 col-md-3">
                                                <div className="details"></div>
                                                <b>Quant: </b>
                                                {this.props.item.QuantidadeItem.includes(".") ? (
                                                    <>
                                                        <span> {this.props.item.QuantidadeItem.split(".")[0]}</span>
                                                        <span>,</span>
                                                        <span style={{ fontSize: "80%" }}>
                                                            {this.props.item.QuantidadeItem.split(".")[1] != "" ? this.props.item.QuantidadeItem.split(".")[1] : "0"}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span> {this.props.item.QuantidadeItem}</span>
                                                )}

                                                <span>{this.props.item.CodUndItem}</span>
                                            </div>
                                            <div className="col-lg-4 col-md-4">
                                                <div className="details"></div>
                                                <b>Valor Unit: </b>
                                                <MoneySpan text={FormataValorParaMoeda(this.props.item.ValorUnitItem, this.props.item.QntdDecimaisPrdItem, true)} />
                                            </div>
                                            <div className="col-lg-4 col-md-4">
                                                <div className="details"></div>
                                                <b>Valor: </b>
                                                <MoneySpan text={FormataValorParaMoeda(this.props.item.ValorUnitItem * this.props.item.QuantidadeItem, 2, true)} />
                                            </div>
                                            <div className="col-1" style={{ textAlign: "right", display: $("#formMode").val() == "VIEW" ? "none" : "block" }}>
                                                <div className="details"></div>
                                                <button className="btn btn-danger btnRemoverItem" onClick={() => this.props.onChangeInputItem("RemoverItem", this.props.countItem)}>
                                                    <i className="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <ul className="nav nav-tabs nav-justified nav-pills coltabs" role="tablist">
                            <li className="collapse-tab active">
                                <a href={"#tabInfoItem_" + id} role="tab" id={"atabInfoItem_" + id} data-toggle="tab" aria-expanded="true" className="tab">
                                    Informações
                                </a>
                            </li>
                            <li className="collapse-tab">
                                <a href={"#tabRateio_" + id} role="tab" id={"atabRateio_" + id} data-toggle="tab" aria-expanded="false" className="tab">
                                    Rateio
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active tabInfoItem" id={"tabInfoItem_" + id}>
                                <div className="row">
                                    <div className="col-md-6 col-lg-4">
                                        <label className="labelFullWidth">
                                            Produto:
                                            <input name="ProdutoItem" type={"text"} className="form-control" readOnly value={item.ProdutoItem || ''} />
                                        </label>
                                        <br />
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <label className="labelFullWidth">
                                            Descrição:
                                            <input
                                                name="DescricaoItem"
                                                type={"text"}
                                                className="form-control DescricaoItem"
                                                value={item.DescricaoItem || ''}
                                                onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "DescricaoItem", e.target.value)}
                                            />
                                        </label>
                                        <br />
                                    </div>
                                    <div className="col-md-12 col-lg-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">
                                                    Quantidade:
                                                    <InputPrefix
                                                        name="QuantidadeItem"
                                                        className="QuantidadeItem"
                                                        value={item.QuantidadeItem || ''}
                                                        onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "QuantidadeItem", e.target.value)}
                                                        CodUndItem={this.props.item.CodUndItem}
                                                    />
                                                </label>
                                                <br />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">
                                                    Valor Unit:
                                                    <InputMoney
                                                        value={this.props.item.ValorUnitItem}
                                                        name="ValorUnitItem"
                                                        className="ValorUnitItem"
                                                        readOnly={$("#atividade").val() != 5 ? true : false}
                                                        QntdCasaDecimais={this.props.item.QntdDecimaisPrdItem}
                                                        onChange={(e) => {
                                                            this.props.onChangeInputItem("ChangeInput", this.props.countItem, "ValorUnitItem", e.target.value);
                                                        }}
                                                    />
                                                </label>
                                                <br />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br />

                                <div className="row" style={{ display: $("#atividade").val() == 5 && $("#formMode").val() != "VIEW" ? "block" : "none" }}>
                                    <div className="col-md-12">
                                        <label className="labelFullWidth">
                                            Programação de Entrega:
                                            <textarea
                                                value={this.props.item.PrazoEntrega}
                                                className="form-control PrazoEntrega"
                                                rows="3"
                                                onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "PrazoEntrega", e.target.value)}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <div className="row">
                                    <div className="col-md-12">
                                        <div style={{ width: "fit-content", verticalAlign: "top", float: "left" }}>
                                            <label className="labelFullWidth">
                                                Sub-Empreiteiro?
                                                <input
                                                    type="checkbox"
                                                    className="checkboxSubEmpreiteiro"
                                                    name="SubEmpreiteiro"
                                                    checked={this.props.item.SubEmpreiteiro}
                                                    onChange={(e) => {
                                                        this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiro", e.target.checked);
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        <div style={{ marginLeft: "150px", display: this.props.item.SubEmpreiteiro ? "block" : "none" }} className="row divSubEmpreiteiro">
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">Sub-Empreiteiro:</label>
                                                <antd.Select
                                                    style={{ width: "100%" }}
                                                    showSearch
                                                    value={this.props.item.SubEmpreiteiroSelect}
                                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                                    onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiroSelect", e)}
                                                    options={this.props.listFornecedores}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">Observação:</label>
                                                <input
                                                    type="text"
                                                    className="form-control inputObservacaoSubEmpreiteiro"
                                                    name="SubEmpreiteiroObservacao"
                                                    value={this.props.item.SubEmpreiteiroObservacao}
                                                    onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiroObservacao", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane tabInfoItem" id={"tabRateio_" + id}>
                                <RateiosItem
                                    RateioCCusto={item.CentroDeCusto}
                                    RateioDepto={item.dpRat}
                                    ValorItem={this.props.item.ValorUnitItem * this.props.item.QuantidadeItem}
                                    listCCustos={this.props.listCCustos}
                                    listDepto={this.props.listDepto}
                                    onChangeRateio={(operacao, countLinhaDepto, attr, value) =>
                                        this.props.onChangeRateioItem(operacao, this.props.countItem, countLinhaDepto, value, attr)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Item extends React.Component {
    //Componente Item usado nas atividade de Inicio e Orcamento
    //Tambem Inclui dentro dele o Componente RateiosItem
    constructor(props) {
        super(props);

        this.state = {
            detailsIsShown: true,
            RateioCCusto: "",
            RateioDepto: []
        };
    }

    handleClickDetails(e) {
        if (this.state.detailsIsShown) {
            $(e.target).closest(".panel").find(".panel-body").slideUp();
        } else {
            $(e.target).closest(".panel").find(".panel-body").slideDown();
        }

        this.setState({
            detailsIsShown: !this.state.detailsIsShown
        });
    }
    

    render() {
        console.log(this.props.item.QuantidadeItem);
        var id = makeid(4);
        return (
            <div className="item">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div>
                            <div style={{ float: "left" }}>
                                <div
                                    className={"details " + (this.state.detailsIsShown == true ? "detailsHide" : "detailsShow")}
                                    onClick={(e) => {
                                        this.handleClickDetails(e);
                                    }}
                                ></div>
                                <h3 className="panel-title countItem" style={{ marginRight: "10px" }}>
                                    Item {this.props.countItem + 1}
                                </h3>
                            </div>
                            <div style={{ display: "grid" }}>
                                <div className="row">
                                    <div className="col-lg-4 col-md-12">
                                        <div className="details"></div>
                                        <b>Descrição: </b>
                                        <span>{this.props.item.DescricaoItem}</span>
                                    </div>
                                    <div className="col-lg-8">
                                        <div className="row">
                                            <div className="col-lg-3 col-md-3">
                                                <div className="details"></div>
                                                <b>Quant: </b>
                                                {this.props.item.QuantidadeItem.includes(".") ? (
                                                    <>
                                                        <span> {this.props.item.QuantidadeItem.split(".")[0]}</span>
                                                        <span>,</span>
                                                        <span style={{ fontSize: "80%" }}>
                                                            {this.props.item.QuantidadeItem.split(".")[1] != "" ? this.props.item.QuantidadeItem.split(".")[1] : "0"}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span> {this.props.item.QuantidadeItem}</span>
                                                )}

                                                <span>{this.props.item.CodUndItem}</span>
                                            </div>
                                            <div className="col-lg-4 col-md-4">
                                                <div className="details"></div>
                                                <b>Valor Unit: </b>
                                                <MoneySpan text={FormataValorParaMoeda(this.props.item.ValorUnitItem, this.props.item.QntdDecimaisPrdItem, true)} />
                                            </div>
                                            <div className="col-lg-4 col-md-4">
                                                <div className="details"></div>
                                                <b>Valor: </b>
                                                <MoneySpan text={FormataValorParaMoeda(this.props.item.ValorUnitItem * this.props.item.QuantidadeItem, 2, true)} />
                                            </div>
                                            <div className="col-1" style={{ textAlign: "right", display: $("#formMode").val() == "VIEW" ? "none" : "block" }}>
                                                <div className="details"></div>
                                                <button className="btn btn-danger btnRemoverItem" onClick={() => this.props.onChangeInputItem("RemoverItem", this.props.countItem)}>
                                                    <i className="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <ul className="nav nav-tabs nav-justified nav-pills coltabs" role="tablist">
                            <li className="collapse-tab active">
                                <a href={"#tabInfoItem_" + id} role="tab" id={"atabInfoItem_" + id} data-toggle="tab" aria-expanded="true" className="tab">
                                    Informações
                                </a>
                            </li>
                            <li className="collapse-tab">
                                <a href={"#tabRateio_" + id} role="tab" id={"atabRateio_" + id} data-toggle="tab" aria-expanded="false" className="tab">
                                    Rateio
                                </a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active tabInfoItem" id={"tabInfoItem_" + id}>
                                <div className="row">
                                    <div className="col-md-6 col-lg-4">
                                        <label className="labelFullWidth">
                                            Produto:
                                            <input name="ProdutoItem" type={"text"} className="form-control" readOnly value={this.props.item.ProdutoItem} />
                                        </label>
                                        <br />
                                    </div>
                                    <div className="col-md-6 col-lg-4">
                                        <label className="labelFullWidth">
                                            Descrição:
                                            <input
                                                name="DescricaoItem"
                                                type={"text"}
                                                className="form-control DescricaoItem"
                                                value={this.props.item.DescricaoItem}
                                                onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "DescricaoItem", e.target.value)}
                                            />
                                        </label>
                                        <br />
                                    </div>
                                    <div className="col-md-12 col-lg-4">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">
                                                    Quantidade:
                                                    <InputPrefix
                                                        name="QuantidadeItem"
                                                        className="QuantidadeItem"
                                                        value={this.props.item.QuantidadeItem}
                                                        onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "QuantidadeItem", e.target.value)}
                                                        CodUndItem={this.props.item.CodUndItem}
                                                    />
                                                </label>
                                                <br />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">
                                                    Valor Unit:
                                                    <InputMoney
                                                        value={this.props.item.ValorUnitItem}
                                                        name="ValorUnitItem"
                                                        className="ValorUnitItem"
                                                        readOnly={$("#atividade").val() != 5 ? true : false}
                                                        QntdCasaDecimais={this.props.item.QntdDecimaisPrdItem}
                                                        onChange={(e) => {
                                                            this.props.onChangeInputItem("ChangeInput", this.props.countItem, "ValorUnitItem", e.target.value);
                                                        }}
                                                    />
                                                </label>
                                                <br />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <br />

                                <div className="row" style={{ display: $("#atividade").val() == 5 && $("#formMode").val() != "VIEW" ? "block" : "none" }}>
                                    <div className="col-md-12">
                                        <label className="labelFullWidth">
                                            Programação de Entrega:
                                            <textarea
                                                value={this.props.item.PrazoEntrega}
                                                className="form-control PrazoEntrega"
                                                rows="3"
                                                onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "PrazoEntrega", e.target.value)}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <br />
                                <div className="row">
                                    <div className="col-md-12">
                                        <div style={{ width: "fit-content", verticalAlign: "top", float: "left" }}>
                                            <label className="labelFullWidth">
                                                Sub-Empreiteiro?
                                                <input
                                                    type="checkbox"
                                                    className="checkboxSubEmpreiteiro"
                                                    name="SubEmpreiteiro"
                                                    checked={this.props.item.SubEmpreiteiro}
                                                    onChange={(e) => {
                                                        this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiro", e.target.checked);
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        <div style={{ marginLeft: "150px", display: this.props.item.SubEmpreiteiro ? "block" : "none" }} className="row divSubEmpreiteiro">
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">Sub-Empreiteiro:</label>
                                                <antd.Select
                                                    style={{ width: "100%" }}
                                                    showSearch
                                                    value={this.props.item.SubEmpreiteiroSelect}
                                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                                    onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiroSelect", e)}
                                                    options={this.props.listFornecedores}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="labelFullWidth">Observação:</label>
                                                <input
                                                    type="text"
                                                    className="form-control inputObservacaoSubEmpreiteiro"
                                                    name="SubEmpreiteiroObservacao"
                                                    value={this.props.item.SubEmpreiteiroObservacao}
                                                    onChange={(e) => this.props.onChangeInputItem("ChangeInput", this.props.countItem, "SubEmpreiteiroObservacao", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane tabInfoItem" id={"tabRateio_" + id}>
                                <RateiosItem
                                    RateioCCusto={this.props.item.RateioCCusto}
                                    RateioDepto={this.props.item.RateioDepto}
                                    ValorItem={this.props.item.ValorUnitItem * this.props.item.QuantidadeItem}
                                    listCCustos={this.props.listCCustos}
                                    listDepto={this.props.listDepto}
                                    onChangeRateio={(operacao, countLinhaDepto, attr, value) =>
                                        this.props.onChangeRateioItem(operacao, this.props.countItem, countLinhaDepto, value, attr)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class TabelaProdutos extends React.Component {
    //Componente usando na atividade inicio para selecao dos produtos
    //Tambem inclui o Componente RateiosItem para configuracao do rateio antes de escolher o produto

    //A ação para escolha do produto é feita dentro do componentDidMount
    //Conforme a dataTable é criada, a trigger on("draw") é criada, e dentro dela a trigger on("click") no botao Adicionar produto
    //Quando clicado no botao Adicionar, a dataTable passa um objeto com os valores do produto selecionado para o metodo this.handleIncluirItem()
    //E o metodo this.handleIncluirItem() inclui no objeto os rateios e repassa até o Componente AppRoot, que é o responsavel por renderizar o Item criado na lista de Itens

    constructor(props) {
        super(props);

        this.state = {
            detailsIsShown: true,
            RateioCCusto: this.props.RateioCCusto,
            RateioDepto: []
        };

        this.handleIncluirItem = this.handleIncluirItem.bind(this);
    }

    handleClickDetails(e) {
        if (this.state.detailsIsShown) {
            $(e.target).closest(".panel").find(".panel-body").slideUp();
        } else {
            $(e.target).closest(".panel").find(".panel-body").slideDown();
        }

        this.setState({
            detailsIsShown: !this.state.detailsIsShown
        });
    }

    componentDidMount() {
        dataTableNovoItem = $("#tableListaNovoProduto").DataTable({
            pageLength: 10,
            columns: [
                { data: "IDPRD" },
                { data: "NOMEFANTASIA" },
                { data: "CODIGOPRD" },
                { data: "CODUNDCONTROLE" },
                {
                    render: function (data, type, row) {
                        return "<button class='btn btn-success marginAuto btnSelecionaProduto' type='button' style='margin:auto;'>Adicionar</button>";
                    },
                    className: "dt-body-center fit-content"
                }
            ],
            language: {
                url: "https://cdn.datatables.net/plug-ins/1.10.21/i18n/Portuguese-Brasil.json"
            }
        });

        dataTableNovoItem.on("draw", { onIncluirItem: this.handleIncluirItem }, (event) => {
            $(".btnSelecionaProduto").off("click");
            $(".btnSelecionaProduto").on("click", { onIncluirItem: event.data.onIncluirItem }, async function (event) {
                var tr = $(this).closest("tr");
                var row = dataTableNovoItem.row(tr);
                var values = row.data();

                var valida = VerificaSePodeIncluirOProdutoSelecionado(values.IDPRD, values.CODIGOPRD + " - " + values.NOMEFANTASIA);

                if (valida == true) {
                    if (isNaN(values.DECIMAIS)) {
                        values.DECIMAIS = 6;
                    }
                    var item = {
                        ProdutoItem: values.CODIGOPRD + " - " + values.NOMEFANTASIA,
                        IdPrdItem: values.IDPRD,
                        CodPrdItem: values.CODIGOPRD,
                        DescPrdItem: values.NOMEFANTASIA,
                        DescricaoItem: "",
                        QuantidadeItem: "",
                        CODTB1FAT: values.CODTB1FAT,
                        ValorUnitItem: "0." + "00000000".substring(0, values.DECIMAIS),
                        CodUndItem: values.CODUNDCONTROLE,
                        QntdDecimaisPrdItem: values.DECIMAIS,
                        PrazoEntrega: "",
                        SubEmpreiteiro: false,
                        SubEmpreiteiroSelect: "",
                        SubEmpreiteiroObservacao: ""
                    };

                    event.data.onIncluirItem(item);
                } else {
                    FLUIGC.toast({
                        title: "Erro ao adicionar o produto: ",
                        message: valida,
                        type: "warning"
                    });
                }
            });
        });

        buscaProdutos().then((produtos) => {
            dataTableNovoItem.clear().draw();
            dataTableNovoItem.rows.add(produtos.values);
            setTimeout(() => {
                dataTableNovoItem.columns.adjust().draw(); //Redraw the DataTable
            }, 500);
        });
    }

    handleIncluirItem(item) {
        item.ItemId = makeid(6);
        item.RateioDepto = [...this.state.RateioDepto];
        item.RateioCCusto = this.state.RateioCCusto;
        this.props.onIncluirItem(item);
    }

    calculaPercentualRateioDepto() {
        var rateios = this.state.RateioDepto.slice();
        var total = 0;
        rateios.forEach((rateio) => {
            total += rateio.Valor ? parseFloat(rateio.Valor) : 0;
        });
        for (var i = 0; i < rateios.length; i++) {
            rateios[i].Percentual = ((rateios[i].Valor * 100) / total).toFixed(2);
        }
        this.setState({
            RateioDepto: rateios
        });
    }

    handleChangeRateio(operacao, countLinhaDepto, attr, value) {
        if (operacao == "AdicionarLinhaRateioDepto") {
            const RateioDepto = [...this.state.RateioDepto];
            RateioDepto.push({
                Departamento: "",
                Valor: "0.0000",
                Percentual: RateioDepto.length < 1 ? "100" : ""
            });
            this.setState({ RateioDepto });
        } else if (operacao == "RemoverLinhaRateioDepto") {
            const RateioDepto = [...this.state.RateioDepto];
            RateioDepto.splice(countLinhaDepto, 1);
            this.setState({ RateioDepto });
        } else if (operacao == "ChangeRateioCCusto") {
            this.setState({ RateioCCusto: value });
        } else if (operacao == "ChangeRateioDepto") {
            if (attr == "Percentual") {
                if (value.includes("%")) {
                    value = value.split("%").join("");
                } else {
                    value = value.substring(0, value.length - 1);
                }
            }

            let RateioDepto = [...this.state.RateioDepto];
            let rateio = { ...RateioDepto[countLinhaDepto], [attr]: value };
            RateioDepto.splice(countLinhaDepto, 1, rateio);
            this.setState({ RateioDepto });
        }
    }

    render() {
        return (
            <div style={{ display: this.props.style == "hide" ? "none" : "block" }}>
                <div id="divRateioIncluirItem" className="panel panel-primary">
                    <div className="panel-heading">
                        <div
                            className={"details " + (this.state.detailsIsShown == true ? "detailsHide" : "detailsShow")}
                            onClick={(e) => {
                                this.handleClickDetails(e);
                            }}
                        ></div>
                        <h4 className="panel-title" style={{ display: "inline-block", verticalAlign: "middle" }}>
                            Incluir item com os seguintes rateios:
                        </h4>
                    </div>
                    <div className="panel-body">
                        <RateiosItem
                            RateioCCusto={this.state.RateioCCusto}
                            RateioDepto={this.state.RateioDepto}
                            listFornecedores={this.props.listFornecedores}
                            listCCustos={this.props.listCCustos}
                            listDepto={this.props.listDepto}
                            ValorItem={0.0}
                            onChangeRateio={(o, c, v, a) => this.handleChangeRateio(o, c, v, a)}
                        />
                    </div>
                </div>
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <h4 className="panel-title">Produtos</h4>
                    </div>
                    <div className="panel-body">
                        <table className="table table-ridge" id="tableListaNovoProduto" style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Produto</th>
                                    <th>Código</th>
                                    <th>Unid. Medida</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

class RateiosItem extends React.Component {
    //Componente usado dentro dos Componentes Item e TabelaProdutos para renderizar os Rateios dos Itens

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.RateioCCusto != nextProps.RateioCCusto ||
            this.props.RateioDepto != nextProps.RateioDepto ||
            this.props.listDepto != nextProps.listDepto ||
            this.props.listCCustos != nextProps.listCCustos ||
            this.props.ValorItem != nextProps.ValorItem
        ) {
            return true;
        }
        return false;
    }

    renderRateiosDepartamento() {
        var RateioDepto = this.props.RateioDepto;
        var retorno = [];

        for (let i = 0; i < RateioDepto.length; i++) {
            const rateio = RateioDepto[i];
            retorno.push(
                <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                        <antd.Select
                            style={{ width: "100%" }}
                            className="selectDepartamento"
                            showSearch
                            value={rateio.Departamento}
                            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                            onChange={(e) => this.props.onChangeRateio("ChangeRateioDepto", i, "Departamento", e)}
                            options={this.props.listDepto}
                        />
                    </td>
                    <td>
                        <input value={FormataValorParaMoeda((this.props.ValorItem * rateio.Percentual) / 100, 4, true)} name="Valor" readOnly className="form-control" />
                    </td>
                    <td>
                        <input
                            type="text"
                            className="form-control Percentual"
                            value={rateio.Percentual.split(".").join(",") + "%"}
                            name="Percentual"
                            onChange={(e) => {
                                const regex = /^[0-9,%]+$/;
                                if (regex.test(e.target.value)) {
                                    this.props.onChangeRateio("ChangeRateioDepto", i, "Percentual", e.target.value);
                                }
                            }}
                        />
                    </td>
                    <td style={{ textAlign: "center" }}>
                        <button
                            className="btn btn-danger"
                            onClick={() => {
                                this.props.onChangeRateio("RemoverLinhaRateioDepto", i);
                            }}
                        >
                            <i className="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                        </button>
                    </td>
                </tr>
            );
        }

        return retorno;
    }

    render() {
        return (
            <div className="rateioItem">
                <div className="row">
                    <div className="col-md-12">
                        <label className="labelFullWidth">
                            Rateio por Centro de Custo:{" "}
                            <antd.Select
                                style={{ width: "100%" }}
                                name="RateioCCusto"
                                className="RateioCCusto"
                                showSearch
                                value={this.props.RateioCCusto}
                                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                onChange={(e) => this.props.onChangeRateio("ChangeRateioCCusto", null, null, e)}
                                options={this.props.listCCustos}
                            />
                        </label>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col-md-12">
                        <b>Rateio Por Departamento:</b>
                        <button className="btn btn-success" onClick={() => this.props.onChangeRateio("AdicionarLinhaRateioDepto")} style={{ float: "right" }}>
                            Adicionar
                        </button>

                        <table className="table table-bordered tableRateioDepartamento">
                            <thead>
                                <tr>
                                    <th>Rateio</th>
                                    <th>Departamento</th>
                                    <th>Valor</th>
                                    <th>Percentual</th>
                                </tr>
                            </thead>
                            <tbody>{this.renderRateiosDepartamento()}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

class InputMoney extends React.Component {
    //Componente usando no valor Unitario do Item
    //Controla os valores digitados para permitir somente valores validos, e tambem faz a conversao do valor formatado em R$ para o valor em Float
    formatValue(value) {
        value = value.split(".");
        var int = value[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        var decimais = value[1] != undefined ? "," + value[1] : "";

        return "R$ " + int + decimais;
    }

    unformatValue(value) {
        value = value.split(".").join("").split(",");
        return value[0].replace(/[^0-9]/g, "") + (value[1] != undefined ? "." + value[1].replace(/[^0-9]/g, "") : "");
    }

    onBlur(value) {
        if (value.split(",").length > 1) {
            value = value.split(",");
            return (
                value[0]
                    .split(".")
                    .join("")
                    .replace(/[^0-9]/g, "") +
                "." +
                (value[1].replace(/[^0-9]/g, "") + "0000000000").substring(0, this.props.QntdCasaDecimais)
            );
        } else {
            value = value.replace(/[^0-9]/g, "");
            return (value == "" ? "0" : value) + "." + "000000000".substring(0, this.props.QntdCasaDecimais);
        }
    }

    onFocus(e) {
        if (this.unformatValue(e.target.value) == 0) {
            e.target.value = "";
            this.props.onChange(e);
        }
    }

    render() {
        return (
            <input
                type="text"
                name={this.props.name}
                value={this.formatValue(this.props.value)}
                className={"form-control " + this.props.className}
                readOnly={this.props.readOnly}
                onChange={(e) => {
                    e.target.value = this.unformatValue(e.target.value);
                    this.props.onChange(e);
                }}
                onFocus={(e) => this.onFocus(e)}
                onBlur={(e) => {
                    e.target.value = this.onBlur(e.target.value);
                    this.props.onChange(e);
                }}
                placeholder="R$ 0,0000"
            />
        );
    }
}

class AppRoot extends React.Component {
    //Componente Pai da Aba Itens na atividade Inicio
    //Nele está o STATE que contem o objeto com os Itens inseridos na solicitacao

    constructor(props) {
        super(props);

        var itens = [];
        if ($("#itens").val() != "") {
            itens = JSON.parse($("#itens").val());
        }

        this.state = {
            abaShown: "itens",
            itens: itens,
            listFornecedores: [],
            listCCustos: []
        };

        this.handleRemoverTodosItens = this.handleRemoverTodosItens.bind(this);
    }

    componentDidMount() {
        DatasetFactory.getDataset(
            "FCFO",
            ["CODCFO", "NOME", "CGCCFO"],
            [
                DatasetFactory.createConstraint("CODCOLIGADA", 0, 0, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCOLIGADA", 1, 1, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.SHOULD),
                DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST)
            ],
            null,
            {
                success: (ds) => {
                    var options = [];
                    ds.values.forEach((fornecedor) => {
                        options.push({
                            value: fornecedor.CODCFO + "___" + fornecedor.CGCCFO + "___" + fornecedor.NOMEFANTASIA,
                            label: fornecedor.CGCCFO + " - " + fornecedor.NOMEFANTASIA
                        });
                    });

                    this.setState({
                        listFornecedores: options
                    });
                }
            }
        );

        DatasetFactory.getDataset(
            "GCCUSTO",
            null,
            [
                DatasetFactory.createConstraint("ATIVO", "T", "T", ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCCUSTO", "1.2.043", "1.2.043", ConstraintType.MUST_NOT)
            ],
            ["CODCCUSTO"],
            {
                success: (ds) => {
                    var retorno = [];
                    ds.values.forEach((ccusto) => {
                        retorno.push({
                            value: ccusto.CODCCUSTO + " - " + ccusto.NOME,
                            label: ccusto.CODCCUSTO + " - " + ccusto.NOME
                        });
                    });

                    this.setState({
                        listCCustos: retorno
                    });
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar Centro de Custo: ",
                        message: error,
                        type: "warning"
                    });
                }
            }
        );
        
        const dataItensSismaVal = $("#dataItensSisma").val();''
		let dataItensSisma = null;
		
		if (dataItensSismaVal && dataItensSismaVal !== "") {
		    try {
		        dataItensSisma = JSON.parse(dataItensSismaVal);
		
		        this.setState({
		            ProdutoItem: `${itemSisma.codigoPRD} ${itemSisma.nomeFantasiaPrd}`,
		            DescricaoItem: itemSisma.descricaoPRD,
		            QuantidadeItem: itemSisma.prdQtd,
		            CentroDeCusto: itemSisma.ccustoRat,
		            PorcentagemRateioCCusto: itemSisma.percentRatCCusto,
		            PorcentagemRateioDepartamento: itemSisma.percentRatDep,
		            DepartamentoRateio: itemSisma.dpRat,
		            objOfficina: itemSisma.objOfficina
		        });
		    } catch (e) {
		        console.error("Erro ao fazer parse de dataItensSisma:", e);
		    }
		}
		
		//$("#tpmov").on("change", this.handleRemoverTodosItens);
        $("#codtmv").on("change", this.handleRemoverTodosItens);
    }

    handleRemoverTodosItens() {
        this.setState({
            itens: []
        });
    }

    handleChangeRateioItem(operacao, itemIndex, countLinhaDepto, value, attr) {
        if (operacao == "AdicionarLinhaRateioDepto") {
            const itens = [...this.state.itens];
            const item = { ...itens[itemIndex] };
            const RateioDepto = [...item.RateioDepto];
            RateioDepto.push({
                Departamento: "",
                Valor: "0.0000",
                Percentual: itens[itemIndex].RateioDepto.length < 1 ? "100" : ""
            });
            item.RateioDepto = RateioDepto;
            itens.splice(itemIndex, 1, item);
            this.setState({ itens });
        } else if (operacao == "RemoverLinhaRateioDepto") {
            const itens = [...this.state.itens];
            const item = { ...itens[itemIndex] };
            const RateioDepto = [...item.RateioDepto];
            RateioDepto.splice(countLinhaDepto, 1);
            item.RateioDepto = RateioDepto;
            itens.splice(itemIndex, 1, item);
            this.setState({ itens });
        } else if (operacao == "ChangeRateioCCusto") {
            var itens = this.state.itens.slice();
            itens[itemIndex].RateioCCusto = value;
            this.setState({ itens: itens });
        } else if (operacao == "ChangeRateioDepto") {
            if (attr == "Percentual") {
                if (value.includes("%")) {
                    value = value.split("%").join("");
                } else {
                    value = value.substring(0, value.length - 1);
                }

                value = value.split(",").join(".");
            }

            let itens = [...this.state.itens];
            let item = { ...itens[itemIndex] };
            let rateioDepto = [...item.RateioDepto];
            let rateio = { ...rateioDepto[countLinhaDepto], [attr]: value };
            rateioDepto.splice(countLinhaDepto, 1, rateio);
            item.RateioDepto = rateioDepto;
            itens.splice(itemIndex, 1, item);
            this.setState({ itens });
        }
    }

    handleChangeItem(operacao, item, attr, value) {
        if (operacao == "IncluirItem") {
            var itens = this.state.itens.slice();
            if (itens.length <= 80) {
                itens.push(item);

                this.setState(
                    {
                        itens: itens
                    },
                    () => {
                        FLUIGC.toast({
                            message: "Item incluido!",
                            type: "success"
                        });
                    }
                );
            } else {
                FLUIGC.toast({
                    message: "Máximo de 80 Itens!",
                    type: "warning"
                });
            }
        } else if (operacao == "RemoverItem") {
            if (confirm("Deseja EXCLUIR o Item?")) {
                var itens = this.state.itens.slice();
                itens.splice(item, 1);
                this.setState(
                    {
                        itens: itens
                    },
                    () => {
                        FLUIGC.toast({
                            message: "Item removido com sucesso!",
                            type: "success"
                        });
                    }
                );
            }
        } else if (operacao == "ChangeInput") {
            var itens = this.state.itens.slice();
            itens[item][attr] = value;
            this.setState({
                itens: itens
            });
        }
    }

    renderItens() {
        var html = [];
        const dataItensSismaElement = document.getElementById('dataItensSisma');
		const hasDataItensSisma = dataItensSismaElement && dataItensSismaElement.value && JSON.parse(dataItensSismaElement.value).length > 0;
        
        $("#itens").val(JSON.stringify(this.state.itens));
        
        for (var i = 0; i < this.state.itens.length; i++) {
            const item = this.state.itens[i];
            
            if (hasDataItensSisma) {
			    html.push(
			        <ItemSisma
			            key={i}
			            item={item}
			            countItem={i}
			            listCCustos={this.state.listCCustos}
			            listDepto={this.props.listDepto}
			            listFornecedores={this.state.listFornecedores}
			            onChangeInputItem={(e, i, j, k) => this.handleChangeItem(e, i, j, k)}
			            onChangeRateioItem={(operacao, item, countLinhaDepto, value, attr) => this.handleChangeRateioItem(operacao, item, countLinhaDepto, value, attr)}
			        />
			    );
			} else {
			    // Adiciona a classe Item se dataItensSisma não estiver preenchido
			    html.push(
			        <Item
			            key={i}
			            item={item}
			            countItem={i}
			            listCCustos={this.state.listCCustos}
			            listDepto={this.props.listDepto}
			            listFornecedores={this.state.listFornecedores}
			            onChangeInputItem={(e, i, j, k) => this.handleChangeItem(e, i, j, k)}
			            onChangeRateioItem={(operacao, item, countLinhaDepto, value, attr) => this.handleChangeRateioItem(operacao, item, countLinhaDepto, value, attr)}
			        />
			    );
			}
        }
        return html;
    }

    render() {
        return (
            <ErrorBoundary>
                <div style={{ display: $("#formMode").val() == "VIEW" ? "none" : "block" }}>
                    <button
                        className="btn btn-success"
                        type={"button"}
                        id="btnAdicionarItem"
                        style={this.state.abaShown == "itens" ? {} : { display: "none" }}
                        onClick={() => {
                            this.setState({ abaShown: "produtos" });
                        }}
                    >
                        Adicionar Item
                    </button>
                    <button
                        className="btn btn-primary"
                        type={"button"}
                        id="btnReturnItens"
                        style={this.state.abaShown == "produtos" ? {} : { display: "none" }}
                        onClick={() => {
                            this.setState({ abaShown: "itens" });
                        }}
                    >
                        Voltar aos itens
                    </button>
                    <button className="btn btn-primary" type={"button"} id="btnAdicionarCotacao" style={{ display: "none" }}>
                        Adicionar Cotação
                    </button>
                </div>

                <br />
                <br />

                <TabelaProdutos
                    onIncluirItem={(e) => this.handleChangeItem("IncluirItem", e)}
                    listDepto={this.props.listDepto}
                    listCCustos={this.state.listCCustos}
                    listFornecedores={this.state.listFornecedores}
                    style={this.state.abaShown == "itens" ? "hide" : ""}
                />
                <div style={{ display: this.state.abaShown == "itens" ? "block" : "none" }}>
                    {this.renderItens()}
                    {this.state.itens.length < 1 && <h2>Nenhum Item Inserido!</h2>}
                </div>
            </ErrorBoundary>
        );
    }
}

class OrcamentoRoot extends React.Component {
    //Componente Pai da atividade Orcamento
    //Nele contem o STATE com os dados dos Orcamentos inseridos, incluido Fornecedor selecionado e Itens cotados

    constructor(props) {
        super(props);
        var orcamentos = null;

        if ($("#cotacoes").val() != "") {
            orcamentos = JSON.parse($("#cotacoes").val());
            var itens = JSON.parse($("#itens").val());
            itens.forEach((item) => {
                orcamentos.forEach((cotacao) => {
                    var found = cotacao.itens.find((obj) => obj.ItemId == item.ItemId);
                    if (found) {
                        found.DescricaoItem = item.DescricaoItem;
                        found.QuantidadeItem = item.QuantidadeItem;
                        found.RateioCCusto = item.RateioCCusto;
                        found.RateioDepto = item.RateioDepto;
                    } else {
                        cotacao.itens.push(item);
                    }
                });
            });

            orcamentos.forEach((cotacao) => {
                for (var i = cotacao.itens.length - 1; i >= 0; i--) {
                    const item = cotacao.itens[i];

                    var found = itens.find((obj) => obj.ItemId == item.ItemId);
                    if (!found) {
                        var index = cotacao.itens.indexOf(item);
                        console.log(cotacao.itens.splice(index, 1));
                    }
                }
            });

            $("#cotacoes").val(JSON.stringify(orcamentos));
        } else {
            orcamentos = [
                {
                    orcamentoId: makeid(6),
                    fornecedor: "",
                    condicaoPagamento: "",
                    itens: JSON.parse($("#itens").val())
                }
            ];
            $("#cotacoes").val(JSON.stringify(orcamentos));
        }

        this.state = {
            orcamentos: orcamentos,
            listFornecedores: [],
            listCCustos: [],
            listDepto: []
        };
    }

    handleChangeOrcamento(operacao, attr, value, orcamento) {
        var orcamentos = this.state.orcamentos.slice();

        if (operacao == "IncluirOrcamento") {
            if (orcamentos.length > 2) {
                FLUIGC.toast({
                    message: "Somente 3 orçamentos permitidos!",
                    type: "warning"
                });
            } else {
                orcamentos.push({
                    orcamentoId: makeid(6),
                    fornecedor: "",
                    condicaoPagamento: "",
                    itens: JSON.parse($("#itens").val())
                });
                this.setState(
                    {
                        orcamentos: orcamentos
                    },
                    () => {
                        $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                        $("#cotacoes").trigger("change");
                        if (this.state.orcamentos.length == 2) {
                            $("#atabMapaCotacao").closest("li").show();
                        }
                    }
                );
            }
        } else if (operacao == "RemoverOrcamento") {
            if (confirm("Deseja EXCLUIR o Orçamento?")) {
                orcamentos.splice(orcamento, 1);
                this.setState(
                    {
                        orcamentos: orcamentos
                    },
                    () => {
                        FLUIGC.toast({
                            message: "Orçamento removido com sucesso!",
                            type: "success"
                        });

                        $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                        $("#cotacoes").trigger("change");
                        if (this.state.orcamentos.length == 1) {
                            $("#atabMapaCotacao").closest("li").hide();
                        }
                    }
                );
            }
        } else if (operacao == "ChangeOrcamento") {
            orcamentos[orcamento][attr] = value;

            this.setState(
                {
                    orcamentos: orcamentos
                },
                () => {
                    $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                }
            );
        } else {
        }
    }

    handleChangeItem(operacao, itemIndex, attr, value, orcamentoIndex) {
        if (operacao == "IncluirItem") {
            const orcamentos = [...this.state.orcamentos];
            const orcamento = { ...orcamentos[orcamentoIndex] };
            const itens = [...orcamento.itens];
            itens.push(itemIndex);
            orcamento.itens = itens;
            orcamentos.splice(orcamentoIndex, 1, orcamento);
            this.setState({ orcamentos }, () => {
                FLUIGC.toast({
                    message: "Item incluido!",
                    type: "success"
                });
                $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                $("#cotacoes").trigger("change");
            });
        } else if (operacao == "RemoverItem") {
            if (confirm("Deseja EXCLUIR o Item?")) {
                const orcamentos = [...this.state.orcamentos];
                const orcamento = { ...orcamentos[orcamentoIndex] };
                const itens = [...orcamento.itens];
                itens.splice(itemIndex, 1);
                orcamento.itens = itens;
                orcamentos.splice(orcamentoIndex, 1, orcamento);
                this.setState({ orcamentos }, () => {
                    FLUIGC.toast({
                        message: "Item removido com sucesso!",
                        type: "success"
                    });
                    $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                    $("#cotacoes").trigger("change");
                });
            }
        } else if (operacao == "ChangeInput") {
            const orcamentos = [...this.state.orcamentos];
            const orcamento = { ...orcamentos[orcamentoIndex] };
            const itens = [...orcamento.itens];
            const item = { ...itens[itemIndex], [attr]: value };
            itens.splice(itemIndex, 1, item);
            orcamento.itens = itens;
            orcamentos.splice(orcamentoIndex, 1, orcamento);
            this.setState({ orcamentos }, () => {
                $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                $("#cotacoes").trigger("change");
            });
        }
    }

    handleChangeRateioItem(operacao, itemIndex, countLinhaDepto, value, attr, orcamentoIndex) {
        if (operacao == "AdicionarLinhaRateioDepto") {
            const orcamentos = [...this.state.orcamentos];
            const orcamento = { ...orcamentos[orcamentoIndex] };
            const itens = [...orcamento.itens];
            const item = { ...itens[itemIndex] };
            const RateioDepto = [...item.RateioDepto];
            RateioDepto.push({
                Departamento: "",
                Valor: "0.0000",
                Percentual: orcamentos[orcamentoIndex].itens[itemIndex].RateioDepto.length < 1 ? "100" : ""
            });
            item.RateioDepto = RateioDepto;
            itens.splice(itemIndex, 1, item);
            orcamento.itens = itens;
            orcamentos.splice(orcamentoIndex, 1, orcamento);
            this.setState({ orcamentos }, () => {
                $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
            });
        } else if (operacao == "RemoverLinhaRateioDepto") {
            const orcamentos = [...this.state.orcamentos];
            const orcamento = { ...orcamentos[orcamentoIndex] };
            const itens = [...orcamento.itens];
            const item = { ...itens[itemIndex] };
            const RateioDepto = [...item.RateioDepto];
            RateioDepto.splice(countLinhaDepto, 1);
            item.RateioDepto = RateioDepto;
            itens.splice(itemIndex, 1, item);
            orcamento.itens = itens;
            orcamentos.splice(orcamentoIndex, 1, orcamento);
            this.setState({ orcamentos }, () => {
                $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
            });
        } else if (operacao == "ChangeRateioCCusto") {
            var orcamentos = this.state.orcamentos.slice();
            orcamentos[orcamentoIndex].itens[itemIndex].RateioCCusto = value;
            this.setState(
                {
                    orcamentos: orcamentos
                },
                () => {
                    $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
                }
            );
        } else if (operacao == "ChangeRateioDepto") {
            if (attr == "Percentual") {
                if (value.includes("%")) {
                    value = value.split("%").join("");
                } else {
                    value = value.substring(0, value.length - 1);
                }

                value = value.split(",").join(".");
            }

            let orcamentos = [...this.state.orcamentos];
            let orcamento = { ...orcamentos[orcamentoIndex] };
            let itens = [...orcamento.itens];
            let item = { ...itens[itemIndex] };
            let rateioDepto = [...item.RateioDepto];
            let rateio = { ...rateioDepto[countLinhaDepto], [attr]: value };
            rateioDepto.splice(countLinhaDepto, 1, rateio);
            item.RateioDepto = rateioDepto;
            itens.splice(itemIndex, 1, item);
            orcamento.itens = itens;
            orcamentos.splice(orcamentoIndex, 1, orcamento);
            this.setState({ orcamentos }, () => {
                $("#cotacoes").val(JSON.stringify(this.state.orcamentos));
            });
        }
    }

    renderOrcamentos() {
        var orcamentos = [];
        this.state.orcamentos.forEach((orcamento, i) => {
            orcamentos.push(
                <Orcamento
                    key={i}
                    orcamento={orcamento}
                    countOrcamento={i}
                    listFornecedores={this.state.listFornecedores}
                    listCCustos={this.state.listCCustos}
                    listDepto={this.state.listDepto}
                    listCondicaoPagamento={this.props.listCondicaoPagamento}
                    onChangeOrcamento={(operacao, attr, value, orcamento) => this.handleChangeOrcamento(operacao, attr, value, orcamento)}
                    onChangeInputItem={(operacao, item, value, attr, orcamento) => this.handleChangeItem(operacao, item, value, attr, orcamento)}
                    onChangeRateioItem={(operacao, item, countLinhaDepto, value, attr, orcamento) =>
                        this.handleChangeRateioItem(operacao, item, countLinhaDepto, value, attr, orcamento)
                    }
                />
            );
        });

        return orcamentos;
    }

    componentDidMount() {
        DatasetFactory.getDataset(
            "FCFO",
            ["CODCOLIGADA", "CODCFO", "NOME", "CGCCFO"],
            [
                DatasetFactory.createConstraint("CODCOLIGADA", 0, 0, ConstraintType.SHOULD),
                DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.SHOULD),
                DatasetFactory.createConstraint("ATIVO", 1, 1, ConstraintType.MUST)
            ],
            null,
            {
                success: (ds) => {
                    var options = [];
                    ds.values.forEach((fornecedor) => {
                        options.push({
                            value: fornecedor.CODCOLIGADA + "___" + fornecedor.CODCFO + "___" + fornecedor.CGCCFO + "___" + fornecedor.NOMEFANTASIA,
                            label: fornecedor.CGCCFO + " - " + fornecedor.NOMEFANTASIA
                        });
                    });

                    this.setState({
                        listFornecedores: options
                    });
                }
            }
        );

        DatasetFactory.getDataset(
            "GCCUSTO",
            null,
            [
                DatasetFactory.createConstraint("ATIVO", "T", "T", ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCOLIGADA", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
                DatasetFactory.createConstraint("CODCCUSTO", "1.2.043", "1.2.043", ConstraintType.MUST_NOT)
            ],
            ["CODCCUSTO"],
            {
                success: (ds) => {
                    var retorno = [];
                    ds.values.forEach((ccusto) => {
                        retorno.push({
                            value: ccusto.CODCCUSTO + " - " + ccusto.NOME,
                            label: ccusto.CODCCUSTO + " - " + ccusto.NOME
                        });
                    });

                    this.setState({
                        listCCustos: retorno
                    });
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar Centro de Custo: ",
                        message: error,
                        type: "warning"
                    });
                }
            }
        );

        DatasetFactory.getDataset(
            "DepartamentosRM",
            null,
            [
                DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
                DatasetFactory.createConstraint("codfilial", $("#filial").val().split(" - ")[0], $("#filial").val().split(" - ")[0], ConstraintType.MUST)
            ],
            null,
            {
                success: (ds) => {
                    var retorno = [];
                    ds.values.forEach((departamento) => {
                        retorno.push({
                            value: departamento.coddepartamento + " - " + departamento.nome,
                            label: departamento.coddepartamento + " - " + departamento.nome
                        });
                    });

                    this.setState({
                        listDepto: retorno
                    });
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar Departamentos: ",
                        message: error,
                        type: "warning"
                    });
                }
            }
        );
    }

    render() {
        return (
            <ErrorBoundary>
                <div>
                    <button className="btn btn-success" onClick={() => this.handleChangeOrcamento("IncluirOrcamento")}>
                        Adicionar Orçamento
                    </button>
                    <br />
                    <br />
                    {this.renderOrcamentos()}
                </div>
            </ErrorBoundary>
        );
    }
}

class Orcamento extends React.Component {
    //Compentente que renderiza o Orcamento na atividade Orcamento
    //Tambem renderiza os Itens do Orcamento

    constructor(props) {
        super(props);

        this.state = {
            detailsIsShown: true
        };
    }

    renderItens() {
        var html = [];
        for (var i = 0; i < this.props.orcamento.itens.length; i++) {
            const item = this.props.orcamento.itens[i];
            html.push(
                <Item
                    key={i}
                    item={item}
                    countItem={i}
                    listCCustos={this.props.listCCustos}
                    listDepto={this.props.listDepto}
                    listFornecedores={this.props.listFornecedores}
                    onChangeInputItem={(operacao, item, value, attr) => this.props.onChangeInputItem(operacao, item, value, attr, this.props.countOrcamento)}
                    onChangeRateioItem={(operacao, item, countLinhaDepto, value, attr) =>
                        this.props.onChangeRateioItem(operacao, item, countLinhaDepto, value, attr, this.props.countOrcamento)
                    }
                />
            );
        }
        return html;
    }

    handleClickDetails(e) {
        if (this.state.detailsIsShown) {
            $(e.target).closest(".panel").find(".panel-body:first").slideUp();
        } else {
            $(e.target).closest(".panel").find(".panel-body:first").slideDown();
        }

        this.setState({
            detailsIsShown: !this.state.detailsIsShown
        });
    }

    renderOptionsCondicaoDePagamento() {
        var options = [];
        listaCondicaoDePagamento.forEach((condicao) => {
            options.push({
                label: condicao.NOME,
                value: condicao.CODCPG + "___" + condicao.NOME
            });
        });
        return options;
    }

    renderFornecedorNome() {
        var fornecedor = this.props.orcamento.fornecedor.split("___");
        if (fornecedor.length != 4) {
            return "Orçamento";
        }
        return fornecedor[2] + " - " + fornecedor[3];
    }

    calculaValorTotal() {
        var itens = this.props.orcamento.itens;
        var total = 0;

        itens.forEach((item) => {
            if (!isNaN(item.ValorUnitItem * item.QuantidadeItem)) {
                total += parseFloat(item.ValorUnitItem * item.QuantidadeItem);
            }
        });

        return total;
    }

    render() {
        return (
            <div className="panel panel-primary orcamento">
                <div className="panel-heading">
                    <div>
                        <div style={{ display: "grid" }}>
                            <div className="row">
                                <div className="col-md-9">
                                    <div
                                        className={"details " + (this.state.detailsIsShown == true ? "detailsHide" : "detailsShow")}
                                        onClick={(e) => {
                                            this.handleClickDetails(e);
                                        }}
                                    ></div>
                                    <h3 className="panel-title countItem" style={{ marginRight: "50px" }}>
                                        {this.renderFornecedorNome()}
                                    </h3>
                                </div>
                                <div className="col-md-2" style={{ textAlign: "right" }}>
                                    <div className="details"></div>
                                    <b>Valor: </b>
                                    <MoneySpan text={FormataValorParaMoeda(this.calculaValorTotal(), 2, true)} />
                                </div>
                                <div className="col-md-1" style={{ textAlign: "right" }}>
                                    <div className="details"></div>
                                    <button
                                        className="btn btn-danger btnRemoverItem"
                                        onClick={() => this.props.onChangeOrcamento("RemoverOrcamento", null, null, this.props.countOrcamento)}
                                    >
                                        <i className="flaticon flaticon-trash icon-sm" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-md-6">
                            <label className="labelFullWidth">
                                Fornecedor:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    className="selectFornecedor"
                                    showSearch
                                    value={this.props.orcamento.fornecedor}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => this.props.onChangeOrcamento("ChangeOrcamento", "fornecedor", e, this.props.countOrcamento)}
                                    options={this.props.listFornecedores}
                                />
                            </label>
                        </div>
                        <div className="col-md-6">
                            <label className="labelFullWidth">
                                Condição de Pagamento:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    className="selectCondicaoPagto"
                                    showSearch
                                    value={this.props.orcamento.condicaoPagamento}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => this.props.onChangeOrcamento("ChangeOrcamento", "condicaoPagamento", e, this.props.countOrcamento)}
                                    options={this.props.listCondicaoPagamento}
                                />
                            </label>
                        </div>
                    </div>
                    <br />
                    {this.renderItens()}
                </div>
            </div>
        );
    }
}

class MoneySpan extends React.Component {
    //Componente usado para mostrar valores númericos, ele deixa as casas decimais com fonte menor
    render() {
        if (this.props.text != "R$ ") {
            return (
                <div style={{ display: "inline-block" }}>
                    <span>{this.props.text.split(",")[0]},</span>
                    <span style={{ fontSize: "80%" }}>{this.props.text.split(",")[1]}</span>
                </div>
            );
        } else {
            return "-";
        }
    }
}

class MapaDeCotacao extends React.Component {
    //Componente usado na atividade Orcamento quanto tem mais de um Fornecedor para selecao dos Itens comprados por Fornecedor
    //As opções de Itens selecionadas são salvas no campo #MapaCotacaoItens, assim quando a OC for gerada o Script vai bater as opções do campo #MapaCotacaoItens com o campo #cotacoes

    constructor(props) {
        super(props);
        var itens = [];
        var orcamentos = JSON.parse($("#cotacoes").val());

        var MapaCotacaoItens = $("#MapaCotacaoItens").val();
        if (MapaCotacaoItens != "") {
            MapaCotacaoItens = JSON.parse(MapaCotacaoItens);
        }

        for (const orcamento of orcamentos) {
            for (const item of orcamento.itens) {
                var found = itens.find((obj) => obj.ItemId == item.ItemId);

                if (!found) {
                    if (MapaCotacaoItens != "") {
                        var found2 = MapaCotacaoItens.find((obj) => obj.item == item.ItemId);
                        console.log(MapaCotacaoItens);
                        console.log(item.ItemId);
                        console.log(found2);
                    }

                    itens.push({
                        item: i,
                        ItemId: item.ItemId,
                        DescricaoItem: item.DescricaoItem,
                        ValorUnitItem: item.ValorUnitItem,
                        QuantidadeItem: item.QuantidadeItem,
                        orcamento: found2 != undefined ? found2.orcamento : ""
                    });
                }
            }
        }

        this.state = {
            itens: itens,
            headerRowHeight: 0
        };
    }

    handleSelection(i, j) {
        if ($("#atividade").val() == 5) {
            var itens = this.state.itens.slice();
            var orcamentos = this.props.orcamentos;

            var found = itens.find((obj) => obj.ItemId == i);

            if (found.orcamento === j) {
                found.orcamento = "";
            } else {
                found.orcamento = j;
                found.ValorUnitItem = orcamentos[j].itens.find((obj) => obj.ItemId == found.ItemId).ValorUnitItem;
                found.QuantidadeItem = orcamentos[j].itens.find((obj) => obj.ItemId == found.ItemId).QuantidadeItem;
            }

            this.setState(
                {
                    itens: itens
                },
                () => {
                    var itensSelected = [];

                    this.state.itens.forEach((item) => {
                        itensSelected.push({
                            item: item.ItemId,
                            orcamento: item.orcamento
                        });
                    });

                    $("#MapaCotacaoItens").val(JSON.stringify(itensSelected));
                    $("#cotacoes").trigger("change");
                }
            );
        }
    }

    componentDidMount() {
        if (this.state.headerRowHeight == 0 && this.headerRow.offsetHeight != 0) {
            this.setState({ headerRowHeight: this.headerRow.offsetHeight });
        }
    }

    componentDidUpdate() {
        if (this.state.headerRowHeight != this.headerRow.offsetHeight) {
            this.setState({ headerRowHeight: this.headerRow.offsetHeight });
        }
    }

    renderTHead() {
        var linha1 = [];
        var linha2 = [];

        for (let i = 0; i < this.props.orcamentos.length; i++) {
            const orcamento = this.props.orcamentos[i];

            linha1.push(
                <th colSpan={2} className={i % 2 != 0 ? "tCellOdd" : ""} style={{ position: "sticky", top: "0", backgroundColor: "white", zIndex: "2" }}>
                    <span style={{ whiteSpace: "nowrap" }}>{orcamento.fornecedor.split("___")[3]}</span>
                    <br />
                    <span style={{ whiteSpace: "nowrap" }}>{orcamento.fornecedor.split("___")[2]}</span>
                </th>
            );

            linha2.push(
                <th className={i % 2 != 0 ? "tCellOdd" : ""} style={{ top: this.state.headerRowHeight + "px", position: "sticky", backgroundColor: "white", zIndex: "2" }}>
                    Valor
                </th>
            );
            linha2.push(
                <th className={i % 2 != 0 ? "tCellOdd" : ""} style={{ top: this.state.headerRowHeight + "px", position: "sticky", backgroundColor: "white", zIndex: "2" }}>
                    Prazo
                </th>
            );
        }

        return (
            <thead>
                <tr ref={(headerRow) => (this.headerRow = headerRow)}>
                    <th rowSpan={2} style={{ backgroundColor: "whitesmoke", position: "sticky", top: "0", zIndex: "3" }} className="tableCellFixed">
                        Item
                    </th>
                    {linha1}
                </tr>
                <tr>{linha2}</tr>
            </thead>
        );
    }

    renderTBody() {
        var cotacoes = this.props.orcamentos;
        var retorno = [];

        for (let i = 0; i < this.state.itens.length; i++) {
            const item = this.state.itens[i];
            var row = [];

            row.push(
                <td style={{ backgroundColor: "whitesmoke" }} className="tableCellFixed">
                    {item.DescricaoItem}
                </td>
            );

            for (let j = 0; j < cotacoes.length; j++) {
                var cotacao = cotacoes[j];

                var found = cotacao.itens.find((obj) => obj.ItemId == item.ItemId);
                if (found) {
                    row.push(
                        <td
                            className={item.orcamento === j ? "success" : j % 2 != 0 ? "tCellOdd" : ""}
                            onClick={() => {
                                this.handleSelection(item.ItemId, j);
                            }}
                        >
                            <span style={{ whiteSpace: "nowrap" }}>{FormataValorParaMoeda(found.QuantidadeItem * found.ValorUnitItem, 2, true)}</span>
                        </td>
                    );
                    row.push(
                        <td
                            className={item.orcamento === j ? "success" : j % 2 != 0 ? "tCellOdd" : ""}
                            onClick={() => {
                                this.handleSelection(item.ItemId, j);
                            }}
                        >
                            <span style={{ whiteSpace: "nowrap" }}>{found.PrazoEntrega}</span>
                        </td>
                    );
                } else {
                    row.push(<td className={j % 2 != 0 ? "tCellOdd" : ""}></td>);
                    row.push(<td className={j % 2 != 0 ? "tCellOdd" : ""}></td>);
                }
            }

            retorno.push(<tr>{row}</tr>);
        }

        return retorno;
    }

    renderTFoot() {
        var retorno = [];
        var cotacoes = this.props.orcamentos;
        var itens = this.state.itens;
        var somas = Array.from({ length: cotacoes.length }, () => 0);
        console.log(itens);

        for (let i = 0; i < itens.length; i++) {
            var item = itens[i];
            console.log(item);
            if (item.orcamento || parseInt(item.orcamento) == 0) {
                var found = cotacoes[item.orcamento].itens.find((obj) => obj.ItemId == item.ItemId);
                somas[item.orcamento] += found.ValorUnitItem * found.QuantidadeItem;
            }
        }

        for (let i = 0; i < cotacoes.length; i++) {
            retorno.push(
                <td colSpan={2} className={i % 2 != 0 ? "tCellOdd" : ""}>
                    Valor: {FormataValorParaMoeda(somas[i], 2, true)}
                </td>
            );
        }

        return (
            <tr>
                <td className="tableCellFixed" style={{ backgroundColor: "whitesmoke" }}>
                    Valor Total:{" "}
                </td>
                {retorno}
            </tr>
        );
    }

    render() {
        return (
            <table className="table table-bordered" style={{ borderCollapse: "separate" }}>
                {this.renderTHead()}
                <tbody>{this.renderTBody()}</tbody>
                <tfoot>{this.renderTFoot()}</tfoot>
            </table>
        );
    }
}

class AprovacaoRoot extends React.Component {
    //Componente Pai usado nas atividades de Aprovação
    //Ele vai renderizar o resumo e passar para o Componente MovimentoAprovacao as props dos Movimentos gerados
    constructor(props) {
        super(props);

        var orcamentos = JSON.parse($("#cotacoes").val());
        var movimentos = null;
        if (orcamentos.length > 1) {
            movimentos = orcamentos.map(({ itens, ...rest }) => ({
                itens: [],
                ...rest
            }));

            var MapaCotacaoItens = JSON.parse($("#MapaCotacaoItens").val());

            MapaCotacaoItens.forEach((item) => {
                movimentos[item.orcamento].itens.push(orcamentos[item.orcamento].itens[item.item]);
            });
        } else {
            movimentos = orcamentos;
        }

        this.state = {
            orcamentos: JSON.parse($("#cotacoes").val()),
            itensSelected: $("#MapaCotacaoItens").val() != "" ? JSON.parse($("#MapaCotacaoItens").val()) : "",
            movimentos: JSON.parse($("#movimentos").val())
        };
    }

    componentDidMount() {
        CarregaInfosAprov();
    }

    calculaTotal() {
        var movimentos = this.state.movimentos;
        var total = 0;

        movimentos.forEach((movimento) => {
            movimento.itens.forEach((item) => {
                total += parseFloat(item.QuantidadeItem) * parseFloat(item.ValorUnitItem);
            });
        });

        return total;
    }

    render() {
        var movimentos = this.state.movimentos;

        return (
            <div>
                <div id="divInfoSolicitacaoAprov">
                    <div className="row">
                        <div className="col-md-2">
                            <b>Coligada:</b>
                            <br />
                            <span id="infoColigada"></span>
                            <br />
                        </div>
                        <div className="col-md-2">
                            <b>Filial:</b>
                            <br />
                            <span id="infoFilial"></span>
                            <br />
                        </div>
                        <div className="col-md-2">
                            <b>Tipo:</b>
                            <br />
                            <span id="infoTipoMov"></span>
                            <br />
                        </div>
                        <div className="col-md-2">
                            <b>Local de Estoque:</b>
                            <br />
                            <span id="infoLocEstoque"></span>
                            <br />
                        </div>
                        <div className="col-md-2">
                            <b>Comprador:</b>
                            <br />
                            <span id="infoComprador"></span>
                            <br />
                        </div>
                        <div className="col-md-2">
                            <b>Total:</b>
                            <br />
                            <span id="infoTotal">{FormataValorParaMoeda(this.calculaTotal(), 2, true)}</span>
                            <br />
                        </div>
                    </div>
                    <br />
                </div>

                {movimentos.map((movimento, i) => (
                    <MovimentoAprovacao key={i} movimento={movimento} />
                ))}
            </div>
        );
    }
}

class MovimentoAprovacao extends React.Component {
    //Componente usado nas atividades de Aprovacao para renderizar os dados do Movimento (Fornecedor, valor, forma de pagamento)
    //Tambem passa para o Componente ItemAprovacao as informações de cada Item que compõem o Movimento para serem renderizadas

    constructor(props) {
        super(props);

        this.state = {
            OpcaoFiltroDeItens: "Sequencia"
        };
    }

    calculaValorTotal() {
        var total = 0;
        this.props.movimento.itens.forEach((item) => {
            total += item.QuantidadeItem * item.ValorUnitItem;
        });

        return total;
    }

    render() {
        var fornecedor = this.props.movimento.fornecedor.split("___");
        var pagamento = this.props.movimento.condicaoPagamento.split("___");
        var itens = this.props.movimento.itens.slice();

        if (this.state.OpcaoFiltroDeItens == "Valor") {
            itens = itens.sort((a, b) => {
                let valorTotalA = a.QuantidadeItem * a.ValorUnitItem;
                let valorTotalB = b.QuantidadeItem * b.ValorUnitItem;

                if (valorTotalA < valorTotalB) {
                    return 1;
                } else if (valorTotalA > valorTotalB) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        return (
            <div className="resumoMovimento">
                <div className="panel panel-primary">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-7" style={{ verticalAlign: "middle" }}>
                                <h5 style={{ margin: "0px" }}>{fornecedor[2] + " - " + fornecedor[3]}</h5>
                            </div>
                            <div className="col-md-5" style={{ textAlign: $("#isMobile").val() != "true" ? "right" : "left", verticalAlign: "middle" }}>
                                {VerificaSeLocalDeEstoqueTemREIDI($("#locEstoque").val().split(" - ")[1]) && (
                                    <span>
                                        <b>REIDI: </b>
                                        <span style={{ marginRight: "40px" }}>{$("#REIDI").val() == "Sim" ? "Sim" : "Não"}</span>
                                    </span>
                                )}

                                <b>Pagamento: </b>
                                <span style={{ marginRight: "40px" }}>{pagamento[1]}</span>
                                {$("#isMobile") == "true" && <br />}
                                <b>Valor: </b>
                                <span>
                                    <MoneySpan text={FormataValorParaMoeda(this.calculaValorTotal(), 2, true)} />{" "}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-md-4 col-md-offset-4" style={{ textAlign: "center" }}>
                                <label>Filtrar Itens por: </label>
                                <select value={this.state.OpcaoFiltroDeItens} onChange={(e) => this.setState({ OpcaoFiltroDeItens: e.target.value })} className="form-control">
                                    <option value="Sequencia">Sequência</option>
                                    <option value="Valor">Maior Valor</option>
                                </select>
                                <br />
                            </div>
                        </div>
                        <div className="row" style={$("#isMobile").val() == "false" ? { display: "flex", flexWrap: "wrap" } : {}}>
                            {itens.map((item, i) => (
                                <ItemAprovacao key={i} item={item} index={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class ItemAprovacao extends React.Component {
    //Componete usado nas atividades de Aprovação para renderizar as informações dos Itens do Movimento

    constructor(props) {
        super(props);

        this.state = {
            detailsIsShown: false
        };
    }

    handleClickDetails(e) {
        if (this.state.detailsIsShown) {
            $(e.target).closest(".card").find(".itemDetails").slideUp();
        } else {
            $(e.target).closest(".card").find(".itemDetails").slideDown();
        }

        this.setState({
            detailsIsShown: !this.state.detailsIsShown
        });
    }

    renderRateiosDepartamento() {
        return (
            <div>
                <b>Rateio por Departamento: </b>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Rateio</th>
                            <th>Departamento</th>
                            <th>Valor</th>
                            <th>Percentual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.item.RateioDepto.map((rateio, i) => (
                            <tr>
                                <td>{i + 1}</td>
                                <td>{rateio.Departamento}</td>
                                <td>
                                    <MoneySpan text={FormataValorParaMoeda((this.props.item.QuantidadeItem * this.props.item.ValorUnitItem * rateio.Percentual) / 100, 2)} />
                                </td>
                                <td>{rateio.Percentual} %</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    render() {
        console.log(this.props.item);
        return (
            <div className={"divColumn " + (this.state.detailsIsShown == true ? "col-lg-12" : "col-lg-3 col-md-4 col-sm-4")} style={{ marginBottom: "10px" }}>
                <div className="card" style={{ height: "100%" }}>
                    <div
                        className="card-header"
                        onClick={(e) => {
                            this.handleClickDetails(e);
                        }}
                    >
                        <div className={"details " + (this.state.detailsIsShown == true ? "detailsHide" : "detailsShow")}></div>
                        <span style={{ verticalAlign: "middle" }}>
                            Item {this.props.index + 1} - {this.props.item.DescPrdItem}
                        </span>
                    </div>
                    <div className="card-body">
                        <h3 className="card-title">
                            <MoneySpan text={FormataValorParaMoeda(this.props.item.QuantidadeItem * this.props.item.ValorUnitItem, 2, true)} />{" "}
                        </h3>
                        <div>
                            <small>
                                <MoneySpan text={FormataValorParaMoeda(this.props.item.QuantidadeItem, 4, false)} />
                                {this.props.item.CodUndItem} x <MoneySpan text={FormataValorParaMoeda(this.props.item.ValorUnitItem, this.props.item.QntdDecimaisPrdItem)} />
                            </small>
                        </div>
                        <div>
                            <p className="card-text">{this.props.item.DescricaoItem}</p>
                        </div>

                        <div className="itemDetails" style={{ display: "none" }}>
                            <hr />
                            <b>Prazo de Entrega: </b>
                            <span>{this.props.item.PrazoEntrega}</span>
                            <br />
                            <br />
                            {this.props.item.SubEmpreiteiro && (
                                <div>
                                    <b>Sub-Empreiteiro: </b>
                                    <span>{this.props.item.SubEmpreiteiroSelect.split("___")[1] + " - " + this.props.item.SubEmpreiteiroSelect.split("___")[2]}</span>
                                    <br />
                                    <b>Observação: </b>
                                    <span>{this.props.item.SubEmpreiteiroObservacao}</span>
                                    <br />
                                    <br />
                                </div>
                            )}

                            <b>Rateio por Centro de Custo: </b>
                            <span>{this.props.item.RateioCCusto}</span>
                            <br />
                            {this.renderRateiosDepartamento()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function InformacoesIniciaisRoot({ listFiliais, listCondicaoPagamento, listFormaPagamento, listTransporte, listLocalEntrega }) {
    const [state, setState] = useState({
        filial: $("#filial").val(),
        locEstoque: $("#locEstoque").val(),
        comprador: $("#comprador").val(),
        dataEntrega: $("#dataEntrega").val(),
        condicaoPgto: $("#condicaoPgto").val(),
        formaPgto: $("#formaPgto").val() == "" ? "009 - Depósito C/C" : $("#formaPgto").val(),
        codTransporte: $("#codTransporte").val(),
        locEntrega: $("#locEntrega").val(),
        locEntrega2: $("#locEntrega2").val(),
        listLocEstoque: [],
        REIDI: $("#REIDI").val() ? $("#REIDI").val() : "Nao",
        natureza: $("#natureza").val(),
        listNaturezas: []
    });

    useEffect(() => {
        if (state.filial != "" && $("#formMode").val() !== "VIEW") {
            buscaLocEstoque();
        }

        calendar = FLUIGC.calendar("#dtEntrega");
        calendar.setDate(state.dataEntrega);
    }, []);

    useEffect(() => {
        BuscaComprador(state.comprador, state.locEstoque.split(" - ")[1]).catch(() => {
            setState((prevState) => ({
                ...prevState,
                comprador: ""
            }));
        });
    }, [state.comprador, state.locEstoque]);

    useEffect(() => {
        buscaLocEstoque();
        if ($("#atividade").val() == 0 || $("#atividade").val() == 4) {
            CriaAppRoot();
        }
        setState((prevState) => ({
            ...prevState,
            natureza: "",
            listNaturezas: optionsNatureza()
        }));
        $("#filial").val(state.filial);
    }, [state.filial]);

    useEffect(() => {
        if (!VerificaSeLocalDeEstoqueTemREIDI(state.locEstoque.split(" - ")[1])) {
            setState((prevState) => ({
                ...prevState,
                REIDI: "Nao"
            }));
        }
        $("#locEstoque").val(state.locEstoque);
    }, [state.locEstoque]);

    useEffect(() => {
        $("#comprador").val(state.comprador);
    }, [state.comprador]);

    useEffect(() => {
        $("#condicaoPgto").val(state.condicaoPgto);
    }, [state.condicaoPgto]);

    useEffect(() => {
        $("#formaPgto").val(state.formaPgto);
    }, [state.formaPgto]);

    useEffect(() => {
        $("#codTransporte").val(state.codTransporte);
    }, [state.codTransporte]);

    useEffect(() => {
        $("#locEntrega").val(state.locEntrega);
    }, [state.locEntrega]);

    useEffect(() => {
        $("#locEntrega2").val(state.locEntrega2);
    }, [state.locEntrega2]);

    useEffect(() => {
        $("#REIDI").val(state.REIDI);
    }, [state.REIDI]);

    useEffect(() => {
        $("#natureza").val(state.natureza);
    }, [state.natureza]);

    useEffect(() => {
        console.log("render");
    });

    function buscaLocEstoque() {
        BuscaLocalDeEstoque(state.filial.split(" - ")[0]).then((list) => {
            setState((prevState) => ({
                ...prevState,
                listLocEstoque: list
            }));
        });
    }

    function CriaAppRoot() {
        DatasetFactory.getDataset(
            "DepartamentosRM",
            null,
            [
                DatasetFactory.createConstraint("codcoligada", $("#coligada").val().split(" - ")[0], $("#coligada").val().split(" - ")[0], ConstraintType.MUST),
                DatasetFactory.createConstraint("codfilial", state.filial.split(" - ")[0], state.filial.split(" - ")[0], ConstraintType.MUST)
            ],
            null,
            {
                success: (ds) => {
                    var retorno = [];

                    for (const departamento of ds.values) {
                        retorno.push({
                            value: departamento.coddepartamento + " - " + departamento.nome,
                            label: departamento.coddepartamento + " - " + departamento.nome
                        });
                    }

                    ReactDOM.render(React.createElement(AppRoot, { listDepto: retorno }), document.querySelector("#App"));
                },
                error: (error) => {
                    FLUIGC.toast({
                        title: "Erro ao buscar Departamentos: ",
                        message: error,
                        type: "warning"
                    });
                }
            }
        );
    }

    function optionsNatureza() {
        var retorno = buscaNatureza(state.filial.split(" - ")[0]);
        if (retorno.length == 0) {
            setState((prev) => ({ ...prev, natureza: "" }));
            $("#natureza").val("");
        }

        retorno = retorno.map((nat) => (
            <option key={nat.IDNAT} value={nat.IDNAT}>
                {nat.CODNAT + " - " + nat.NOME}
            </option>
        ));
        retorno.push(<option></option>);
        return retorno;
    }

    return (
        <ErrorBoundary>
            <div>
                <div className="row">
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Filial:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.filial}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, filial: e }))}
                                    options={listFiliais}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Local de Estoque:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.locEstoque}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, locEstoque: e }))}
                                    options={state.listLocEstoque}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Comprador:
                                <select value={state.comprador} className="form-control" onChange={(e) => setState((prevState) => ({ ...prevState, comprador: e.target.value }))}>
                                    <option value=""></option>
                                    <option value="Matriz">Matriz</option>
                                    <option value="Obra">Obra</option>
                                    {validaGrupo($("#userCode").val(), ["Administrador TI", "Controladoria"]) != "false" && <option value="Controladoria">Controladoria</option>}
                                </select>
                            </label>
                        </div>
                        <br />
                    </div>
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Data de Entrega:
                                <br />
                                <input
                                    type="text"
                                    id="dtEntrega"
                                    className="form-control"
                                    onChange={(e) => {
                                        console.log(e);
                                    }}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Condição de Pagamento:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.condicaoPgto}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, condicaoPgto: e }))}
                                    options={listCondicaoPagamento}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Forma de Pagamento:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.formaPgto}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, formaPgto: e }))}
                                    options={listFormaPagamento}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Transporte:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.codTransporte}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, codTransporte: e }))}
                                    options={listTransporte}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Local de entrega:
                                <antd.Select
                                    style={{ width: "100%" }}
                                    showSearch
                                    value={state.locEntrega}
                                    filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, locEntrega: e }))}
                                    options={listLocalEntrega}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                    <div className="col-md-6">
                        <div className="form-input">
                            <label className="labelFullWidth">
                                Se necessário, informe o endereço desejado:
                                <input
                                    type="text"
                                    className="form-control"
                                    value={state.locEntrega2}
                                    onChange={(e) => setState((prevState) => ({ ...prevState, locEntrega2: e.target.value }))}
                                />
                            </label>
                        </div>
                        <br />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6" style={{ display: VerificaSeLocalDeEstoqueTemREIDI(state.locEstoque.split(" - ")[1]) ? "block" : "none" }}>
                        <label className="labelFullWidth">
                            REIDI:
                            <select value={state.REIDI} className="form-control" onChange={(e) => setState((prevState) => ({ ...prevState, REIDI: e.target.value }))}>
                                <option value=""></option>
                                <option value="Sim">Sim</option>
                                <option value="Nao">Não</option>
                            </select>
                        </label>
                    </div>
                    <div className="col-md-6" style={{ display: $("#coligada").val() == "2 - CASTILHO MINERACAO" ? "block" : "none" }}>
                        <label className="labelFullWidth">
                            Natureza Fiscal:
                            <select value={state.natureza} className="form-control" onChange={(e) => setState((prevState) => ({ ...prevState, natureza: e.target.value }))}>
                                {state.listNaturezas}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

class ResumoOrcamento extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            Justificativa: $("#JustificativaOrcamento").val()
        };
    }

    calculaValorTotal() {
        var cotacoes = $("#cotacoes").val();
        var soma = 0;

        if (cotacoes) {
            cotacoes = JSON.parse(cotacoes);
            if (cotacoes.length == 1) {
                for (const Item of cotacoes[0].itens) {
                    soma += Item.QuantidadeItem * Item.ValorUnitItem;
                }
            } else if (cotacoes.length > 1) {
                //Caso tenha mais de um orçamento verifica o Mapa de Cotacao para calcular o valor total
                var MapaCotacaoItens = $("#MapaCotacaoItens").val();
                if (MapaCotacaoItens) {
                    MapaCotacaoItens = JSON.parse(MapaCotacaoItens);

                    //Cria uma lista com todos os Itens das Cotacoes
                    var movimentos = cotacoes.map(({ itens, ...rest }) => ({
                        itens: [],
                        ...rest
                    }));

                    //Verifica qual Orcamento selecionada para cada Item, e então busca na lista dos Itens o Item correspondente ao orcamento selecionado
                    MapaCotacaoItens.forEach((item) => {
                        if (item.orcamento !== "") {
                            movimentos[item.orcamento].itens.push(cotacoes[item.orcamento].itens.find((obj) => obj.ItemId == item.item));
                        }
                    });

                    for (var i = movimentos.length - 1; i >= 0; i--) {
                        if (movimentos[i].itens.length == 0) {
                            movimentos.splice(i, 1);
                        }
                    }

                    for (const Movimento of movimentos) {
                        for (const Item of Movimento.itens) {
                            soma += Item.QuantidadeItem * Item.ValorUnitItem;
                        }
                    }
                }
            }
        }

        return (
            <span>
                <MoneySpan text={FormataValorParaMoeda(soma.toFixed(2).toString(), 2)} />
                {" (" + soma.toFixed(2).toString().split(".").join(",").extenso(true) + ")"}
            </span>
        );
    }

    handleInput(e, target) {
        this.setState({
            [target]: e.target.value
        });

        if (target == "Justificativa") {
            $("#JustificativaOrcamento").val(e.target.value);
        }
    }

    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading">
                    <h3 className="panel-title">Resumo</h3>
                </div>
                <div className="panel-body">
                    <h4>
                        <span>Valor Total: </span>
                        <span>{this.calculaValorTotal()}</span>
                    </h4>
                    <br />

                    <div>
                        <label htmlFor="textAreaJustificativa">Justificativa:</label>
                        {$("#formMode").val() == "VIEW" || $("#atividade").val() != 5 ? (
                            <textarea
                                name="textAreaJustificativa"
                                className="form-control"
                                rows="4"
                                value={this.state.Justificativa}
                                readOnly
                                onChange={(e) => this.handleInput(e, "Justificativa")}
                            />
                        ) : (
                            <textarea
                                name="textAreaJustificativa"
                                className="form-control"
                                rows="4"
                                value={this.state.Justificativa}
                                onChange={(e) => this.handleInput(e, "Justificativa")}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
