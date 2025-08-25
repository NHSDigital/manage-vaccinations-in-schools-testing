/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5104181687094449, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.00851063829787234, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9125939849624061, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8552631578947368, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.8173483779971791, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8588709677419355, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0038684719535783366, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.007952286282306162, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0625, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [1.0, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.4333958724202627, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.625, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.00546448087431694, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4117647058823529, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.2306145893164848, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.875, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.5403726708074534, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.6875, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.5625, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.002652519893899204, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.7549019607843137, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.8241965973534972, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.625, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9513888888888888, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6487252124645893, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.4375, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.7272089761570828, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11320, 0, 0.0, 773.6119257950494, 0, 4724, 580.5, 1530.0, 1776.0, 2347.9499999999953, 3.143917838206545, 66.37672369565598, 4.160157394556551], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 2, 0, 0.0, 7281.0, 6654, 7908, 7281.0, 7908.0, 7908.0, 7908.0, 0.006389347679548656, 1.4763386482057113, 0.10249162596119749], "isController": true}, {"data": ["2.0 Register attendance", 705, 0, 0.0, 3504.31773049645, 1267, 5940, 3633.0, 4583.799999999999, 4859.299999999999, 5468.76, 0.1999509340261184, 28.678931557397974, 0.7490809214547353], "isController": true}, {"data": ["2.5 Select patient", 532, 0, 0.0, 433.4323308270675, 319, 1495, 377.0, 708.9999999999998, 814.0, 1039.1099999999988, 0.1516849719824741, 3.5708984861155506, 0.10517219737066077], "isController": false}, {"data": ["2.5 Select menacwy", 380, 0, 0.0, 496.43157894736856, 323, 1473, 393.0, 832.0, 870.75, 1034.6499999999999, 0.11578563447633053, 2.992861370488283, 0.08073334278916014], "isController": false}, {"data": ["2.3 Search by first/last name", 709, 0, 0.0, 537.4259520451327, 329, 1552, 419.0, 859.0, 980.5, 1290.1, 0.20091844383139287, 6.845577498391802, 0.1568549006282598], "isController": false}, {"data": ["2.5 Select td_ipv", 372, 0, 0.0, 497.0215053763441, 324, 1981, 391.5, 834.7, 877.7499999999998, 1232.5799999999972, 0.11738811445341159, 3.0720972598592606, 0.08173606016140866], "isController": false}, {"data": ["4.0 Vaccination for flu", 517, 0, 0.0, 2856.789168278527, 1009, 6025, 2756.0, 3449.0, 3852.7999999999993, 4485.240000000009, 0.1505265517773488, 7.364567444975557, 0.9032699150158242], "isController": true}, {"data": ["4.0 Vaccination for hpv", 503, 0, 0.0, 2863.5049701789285, 1021, 5877, 2802.0, 3372.2, 3555.0, 4271.999999999997, 0.15049674397452026, 7.064191323567252, 0.9072653691620802], "isController": true}, {"data": ["5.8 Consent confirm", 8, 0, 0.0, 2012.0, 1483, 3120, 1833.0, 3120.0, 3120.0, 3120.0, 0.008905571993757194, 0.9194959599316053, 0.019696185715685162], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 158.91428571428574, 154, 178, 158.0, 164.0, 168.0, 178.0, 0.07877968024453214, 0.47283194803017037, 0.047467834678590164], "isController": false}, {"data": ["Get correct patient name", 696, 0, 0.0, 0.40086206896551757, 0, 88, 0.0, 1.0, 1.0, 1.0, 0.19730905600373755, 0.0, 0.0], "isController": false}, {"data": ["5.9 Patient home page", 8, 0, 0.0, 394.875, 331, 485, 398.5, 485.0, 485.0, 485.0, 0.008936879934135195, 0.23916517637211826, 0.00667429582971669], "isController": false}, {"data": ["2.4 Patient attending session", 533, 0, 0.0, 1198.3489681050655, 868, 3118, 1105.0, 1571.6000000000001, 1802.6999999999996, 2258.9199999999996, 0.15146761605318018, 5.4480028507278115, 0.22513057776654322], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 169.0, 169, 169, 169.0, 169.0, 169.0, 169.0, 5.9171597633136095, 28.354983357988164, 4.322300295857988], "isController": false}, {"data": ["5.4 Consent route", 8, 0, 0.0, 588.5, 488, 903, 514.5, 903.0, 903.0, 903.0, 0.00892041760935038, 0.10878945821286123, 0.014223449073893396], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 472.45714285714286, 455, 530, 470.0, 482.9, 492.25, 530.0, 0.07887181752216299, 0.44142029904249613, 0.042747908910937944], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 904.4285714285718, 826, 1201, 880.0, 1019.4, 1059.25, 1201.0, 0.07837236276999278, 1.209107995156588, 0.1733529313222985], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 366, 0, 0.0, 2971.9562841530033, 1028, 5686, 2876.0, 3614.9, 3956.1499999999996, 4499.6399999999985, 0.11681601668873191, 6.023316198156509, 0.705483225830415], "isController": true}, {"data": ["2.1 Open session", 714, 0, 0.0, 1148.8753501400556, 471, 4042, 1067.0, 1712.5, 1929.75, 2716.8000000000047, 0.2011983418326013, 3.5283908203644, 0.13160492028572418], "isController": false}, {"data": ["4.3 Vaccination confirm", 1741, 0, 0.0, 1592.0689259046503, 1038, 4724, 1541.0, 2089.0, 2360.7999999999997, 2950.16, 0.5120823190711103, 11.141590016703708, 1.1918587408900232], "isController": false}, {"data": ["5.6 Consent questions", 8, 0, 0.0, 540.875, 478, 870, 492.0, 870.0, 870.0, 870.0, 0.008906256088260999, 0.11223926587400987, 0.022289558388858273], "isController": false}, {"data": ["4.1 Vaccination questions", 1771, 0, 0.0, 698.4940711462436, 476, 3803, 680.0, 873.0, 987.3999999999999, 1393.56, 0.5125363022430336, 6.416861781425407, 1.081800229045991], "isController": false}, {"data": ["5.3 Consent parent details", 8, 0, 0.0, 516.125, 488, 577, 508.0, 577.0, 577.0, 577.0, 0.008939606255042497, 0.10470426525376189, 0.016550057185543764], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 8, 0, 0.0, 570.5, 499, 776, 529.0, 776.0, 776.0, 776.0, 0.00890224225226729, 0.13700998546430757, 0.014203162382462583], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1957.8714285714284, 1836, 2386, 1917.5, 2151.0, 2197.9, 2386.0, 0.0787501673441056, 3.9858812727320796, 0.3113861597424645], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 377, 0, 0.0, 2937.047745358091, 1048, 5959, 2835.0, 3467.8, 3684.8999999999983, 4483.799999999984, 0.1161853961428914, 5.887203660787645, 0.7034467032432368], "isController": true}, {"data": ["5.0 Consent for td_ipv", 2, 0, 0.0, 7293.0, 6595, 7991, 7293.0, 7991.0, 7991.0, 7991.0, 0.006548145237861376, 1.512787811446158, 0.10501971605605212], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 510, 0, 0.0, 588.213725490196, 322, 1588, 483.5, 871.8000000000001, 925.9, 1214.5899999999997, 0.15046844366948278, 3.7069343432974424, 0.11211662355450719], "isController": false}, {"data": ["2.5 Select flu", 529, 0, 0.0, 514.3119092627597, 320, 1780, 390.0, 829.0, 877.0, 1068.6000000000008, 0.15190790877370117, 3.6800322990063097, 0.10532677268489045], "isController": false}, {"data": ["5.1 Consent start", 8, 0, 0.0, 928.75, 667, 1010, 960.0, 1010.0, 1010.0, 1010.0, 0.008879269680068814, 0.13019207490496407, 0.019236972446516273], "isController": false}, {"data": ["5.5 Consent agree", 8, 0, 0.0, 593.375, 496, 1004, 539.0, 1004.0, 1004.0, 1004.0, 0.008926369723539173, 0.15516759049944154, 0.014067313614610681], "isController": false}, {"data": ["1.5 Open Sessions list", 72, 0, 0.0, 422.37500000000017, 376, 790, 404.5, 518.6000000000001, 570.7, 790.0, 0.023483902111268034, 0.553935714448797, 0.014069064076805407], "isController": false}, {"data": ["4.2 Vaccination batch", 1765, 0, 0.0, 629.4883852691221, 468, 1994, 520.0, 959.0, 1011.0, 1426.6799999999998, 0.5117597460511865, 7.815271503405159, 0.8285600274973006], "isController": false}, {"data": ["5.0 Consent for hpv", 2, 0, 0.0, 7107.0, 6715, 7499, 7107.0, 7499.0, 7499.0, 7499.0, 0.00639971329284448, 1.4625719767754404, 0.10258290428588798], "isController": true}, {"data": ["5.7 Consent triage", 8, 0, 0.0, 993.125, 541, 1653, 983.0, 1653.0, 1653.0, 1653.0, 0.008926509165851193, 0.15025455021830894, 0.015072201511481165], "isController": false}, {"data": ["5.0 Consent for flu", 2, 0, 0.0, 6871.5, 6565, 7178, 6871.5, 7178.0, 7178.0, 7178.0, 0.0061037205228447, 1.419323644821451, 0.09537063316944844], "isController": true}, {"data": ["2.2 Session register", 713, 0, 0.0, 597.0701262272088, 334, 2291, 515.0, 988.6, 1108.6999999999996, 1631.2400000000011, 0.20119708030020975, 9.379313113908587, 0.1333709969399984], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11320, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
