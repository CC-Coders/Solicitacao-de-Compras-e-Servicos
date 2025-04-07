function displayFields(form, customHTML) {
    form.setValue("atividade", getValue("WKNumState"));
    form.setValue("formMode", form.getFormMode());
    form.setValue("userCode", getValue("WKUser"));
    form.setValue("numProcess", getValue("WKNumProces"));
    form.setValue("isMobile", form.getMobile());

    var user = getValue("WKUser");
    if (getValue("WKReplacement")) {
        user = getValue("WKReplacement");
    }


    if (user == "alysson.silva1") {
        form.setValue("userCode", "alysson.silva");
    } else if (user == "ademir.rodrigues") {
        form.setValue("userCode", "ademir.rodrigues");
    }
    else if (user == "fernando.jarvorski") {
        form.setValue("userCode", "fernandoj");
    } else {
        form.setValue("userCode", user);
    }



    if (getValue('WKNumState') == 0 || getValue('WKNumState') == 4) {
        form.setValue("solicitante", user);
    }
    /* else if(getValue('WKNumState') == 5){
         form.setValue("userComprador", getValue("WKUser"));
     }*/
}