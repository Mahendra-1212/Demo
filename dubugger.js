var debuggerData={};
function applyFormula(object, elmObj, itrType) {
    console.log(elmObj);
    console.log("Below fields to calculate here");
    console.table(object);
    if (!itrType) {
        itrType = formData.itrType;
    }
    console.log("Inside applyFormula() object :: " + JSON.stringify(object));
    var isNegative = elmObj.getAttribute("data-isNegative") || "false";
    var tagName = elmObj.tagName.toLowerCase();
    var currValue;
    if (tagName == "label" || tagName == "p") {
        currValue = elmObj.textContent;
    } else {
        currValue = elmObj.value;
    }
    if (isNegative == "false" && currValue.startsWith("-")) {
        currValue = currValue.replace(/-/g, '');
        if (tagName == "label" || tagName == "p") {
            elmObj.textContent = currValue;
        } else {
            elmObj.value = currValue;
        }
        return;
    }
    let plgn = $(elmObj).closest('.uniservenxtcmp_Bootstrap_repeativetemplate_js');
    if (plgn.length > 0 && (plgn.attr("initialempty") != "yes" || (plgn.attr("initialempty") == "yes" && plgn.attr('ang_add'))) && !plgn[0].hasAttribute('secondaryentnames') && !document.querySelector('[remove_all=' + plgn.attr("id") + ']')) {
        console.log("applyFormula for repetative..!");
        try {
            var currentElement = $(elmObj);
            if (currentElement.attr('entityname') && currentElement.attr('name')) {
                var entName = plgn.attr('entityname');
                if (typeof window !== "undefined" && entName && window['localFormData']) {
                    var dummyData = [];
                    var originalCopy = getFormData(entName, true);
                    var isAcceptEmptyVal = plgn.hasClass("allow-empty-values");
                    plgn.find('.unxtselectedelm').each(function(index) {
                        var curRow = $(this);
                        var dummyRow = {};
                        curRow.find('[entityname][name]').each(function() {
                            var $bindElm = $(this);
                            var bindElm = this;
                            var bindElmEntName = $bindElm.attr('entityname');
                            var bindElmName = $bindElm.attr('name');
                            if (bindElmEntName && bindElmName) {
                                var tgName = bindElm.tagName.toLowerCase();
                                switch (tgName) {
                                case 'label':
                                    dummyRow[bindElmEntName + "_" + bindElmName] = $bindElm.text().trim();
                                    break;
                                case 'input':
                                case 'select':
                                    var binddElmVal = $bindElm.val();
                                    var inputType = $bindElm.attr('type');
                                    if (inputType == "checkbox" || inputType == "radio") {
                                        dummyRow[bindElmEntName + "_" + bindElmName] = bindElm.checked;
                                        break;
                                    }
                                    if (!bindElm.classList.contains('datepciker_src') && ((binddElmVal != null && binddElmVal != undefined) || isAcceptEmptyVal)) {
                                        var disppr = bindElm.getAttribute("disppr");
                                        var valpr = bindElm.getAttribute("valpr");
                                        if (disppr) {
                                            dummyRow[bindElmEntName + "_" + disppr] = bindElm.options[bindElm.selectedIndex].text.trim();
                                        }
                                        if (!valpr) {
                                            valpr = bindElmName;
                                        }
                                        dummyRow[bindElmEntName + "_" + valpr] = binddElmVal;
                                    }
                                    break;
                                }
                            }
                        });
                        if (originalCopy && originalCopy[index]) {
                            Object.keys(originalCopy[index]).forEach(function(key) {
                                if (!dummyRow.hasOwnProperty(key)) {
                                    dummyRow[key] = originalCopy[index][key];
                                }
                            })
                        }
                        dummyData.push(dummyRow);
                    });
                    localFormData[entName] = dummyData;
                }
            }
        } catch (e) {
            console.error(e);
        }
    } 
    try {
        if (object && Object.keys(object).length > 0) {
            console.log("applyFormula for Field..!");
            var fieldComputationInfo;
            if (typeof (pdmsInfo) !== 'undefined') {
                fieldComputationInfo = pdmsInfo.getPdmTemplate(itrType);
            }
            if (typeof (fieldComputationInfo) !== "undefined") {
                for (var ind in object) {
                    debuggerData.push({fieldName:ind});
                    console.log("involvedField :: " + ind);
                    var ind2 = ind.replace(".", "_");
                    var currComputaionInfo = fieldComputationInfo[ind2];
                    if (currComputaionInfo && currComputaionInfo.hasOwnProperty("computationInfo") && currComputaionInfo["computationInfo"].hasOwnProperty("formula") && currComputaionInfo["computationInfo"]["formula"] !== "") {
                        var currFldCompuInfo = currComputaionInfo["computationInfo"];
                        var currFormulla = currFldCompuInfo["formula"];
                        debuggerData.push({currentFormula:currFormulla});
                        console.log("computation formula :: " + currFormulla);
                        var maxValue, minValue;
                        if (currFldCompuInfo.hasOwnProperty("maxValue")) {
                            debuggerData.push({maxValue:currFldCompuInfo["maxValue"]});
                            maxValue = replaceDynamicValue(currFldCompuInfo["maxValue"], "applyFormula", "integer", elmObj);
                            console.log("computation maxValue :: " + maxValue);
                            debuggerData.push({maxValueResult:maxValue});
                        }
                        if (currFldCompuInfo.hasOwnProperty("minValue")) {
                            debuggerData.push({minValue:currFldCompuInfo["minValue"]});
                            minValue = replaceDynamicValue(currFldCompuInfo["minValue"], "applyFormula", "integer", elmObj);
                            console.log("computation minValue :: " + minValue);
                            debuggerData.push({minValueResult:minValue});
                        }
                        var value = replaceDynamicValue(currFormulla, "applyFormula", "integer", elmObj);
                        debuggerData.push({dynamicValue:value});
                        console.log("computation formula values :: " + value);
                        try {
                            var currComputation;
                            try {
                                currComputation = nxtUtils.nxtExec(value);
                                debuggerData.push({finalValueEval:currComputation});
                            } catch (e) {
                                console.log("Evaluation failed :: ", e);
                                currComputation = 0;
                            }
                            console.log("computation formula nxtUtils.nxtExec Response :: " + currComputation);
                            if (maxValue && Number(currComputation) > Number(maxValue)) {
                                currComputation = maxValue;
                            } else if (minValue && Number(currComputation) < Number(minValue)) {
                                currComputation = minValue;
                            }
                            debuggerData.push({finalValue:currComputation});
                            console.log("computation formula final Response :: " + currComputation);
                            var currField = ind.split(".");
                            var entName1 = currField[0]
                              , fName = currField[1];
                            
                            setDomValue(entName1, fName, currComputation, elmObj, ind2);
                        } catch (e) {
                            console.error("error in computation ", e)
                        }finally{
                            console.table( debuggerData);
                        }
                    } else {
                        applyFormulaCondition(ind, elmObj, itrType);
                    }
                }
            }
        }
    } catch (e) {
        console.error("exception in applyFormula ", e)
    }
}




function applyFormulaCondition(involvedField, elmObj, itrType) {
    console.log("Inside applyFormulaCondition() --> involvedField :: " + involvedField);
    if (!itrType) {
        itrType = formData.itrType;
    }
    var offlineFieldValidations;
    if (typeof (pdmsInfo) !== 'undefined') {
        offlineFieldValidations = pdmsInfo.getPdmTemplate(itrType);
    }
    if (typeof (offlineFieldValidations) !== 'undefined') {
        var involvedField1 = involvedField ? involvedField.replace(".", "_") : "";
        var fieldObj = typeof window != "undefined" ? window["fieldValidations"] ? fieldValidations[involvedField1] : offlineFieldValidations[involvedField1] : offlineFieldValidations[involvedField1];
        if (fieldObj) {
            var datatype = fieldObj["type"];
            var validationsRule = fieldObj["validationRules"];
            if (validationsRule && validationsRule != false && validationsRule != "false" && validationsRule.length > 0) {
                for (var ind = 0; ind < validationsRule.length; ind++) {
                    if (!validationsRule[ind].hasOwnProperty("isEnabled") || validationsRule[ind].isEnabled === true) {
                        var conditions = validationsRule[ind]["conditions"];
                        var conditionRules = conditions["rules"];
                        var tempExpr = conditions["expr"];
                        tempExpr = tempExpr ? tempExpr.replace(/''/g, null) : undefined;
                        tempExpr = tempExpr ? tempExpr.replace(/""/g, null) : undefined;
                        console.log("Computation Expression :: " + tempExpr);
                        var expression = changeExpWithDynamicVal(conditionRules, tempExpr, elmObj);
                        console.log("Computation Expression values :: " + expression);
                        var exprCheck;
                        try {
                            exprCheck = nxtUtils.nxtExec(expression);
                        } catch (e) {
                            exprCheck = false;
                            console.error(e)
                        }
                        console.log("Computation Expression Response :: " + exprCheck);
                        $("[getcurrelm]").removeAttr("getcurrelm");
                        if (exprCheck) {
                            performComputation(validationsRule[ind], involvedField, datatype, elmObj);
                        }
                    }
                }
            }
        }
    }
}