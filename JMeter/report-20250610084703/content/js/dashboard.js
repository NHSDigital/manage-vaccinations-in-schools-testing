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

    var data = {"OkPercent": 99.98798004687782, "KoPercent": 0.012019953122182823};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6594224037339557, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9785714285714285, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.4994413407821229, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4215817694369973, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.4932049830124575, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.85, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6134593993325917, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9758064516129032, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4948700410396717, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7845528455284553, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.9906976744186047, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.4989946380697051, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [1.0, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent"], "isController": true}, {"data": [1.0, 500, 1500, "Already vaccinated"], "isController": false}, {"data": [0.8605015673981191, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.05936227951153324, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8828213879408419, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9927616926503341, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9582484725050916, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.5, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.75, 500, 1500, "5.1 Consent homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16639, 2, 0.012019953122182823, 489.6836348338247, 0, 2321, 416.0, 877.0, 975.0, 1204.0, 4.621929038014318, 117.29182826552037, 5.142691191029363], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 891, 0, 0.0, 3416.372615039282, 2075, 5231, 3389.0, 3829.8, 4001.4, 4469.040000000001, 0.25379756354339, 36.311769346171474, 1.1026187058168635], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 329.3, 285, 906, 304.5, 383.49999999999994, 488.60000000000014, 906.0, 0.07864028696964148, 1.129839747946646, 0.11365978976080995], "isController": false}, {"data": ["2.3 Search by first/last name", 895, 0, 0.0, 715.0424581005578, 588, 2004, 687.0, 834.4, 910.3999999999995, 1217.1599999999999, 0.25444272636376325, 8.61564260221277, 0.21949100003027727], "isController": false}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 723.0, 723, 723, 723.0, 723.0, 723.0, 723.0, 1.3831258644536653, 117.43197830221301, 3.0053271957123098], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 95.2142857142857, 89, 144, 93.0, 100.0, 111.80000000000001, 144.0, 0.07881675779385139, 0.47497872299400096, 0.04749017535039679], "isController": false}, {"data": ["3.0 Nurse triage", 1492, 0, 0.0, 1340.9108579088515, 823, 2849, 1340.0, 1563.0, 1681.0, 1947.4899999999996, 0.4329377408252455, 51.328588913681735, 1.3021337735181386], "isController": true}, {"data": ["2.4 Patient attending session", 883, 0, 0.0, 956.9093997734992, 759, 2069, 902.0, 1156.6, 1235.1999999999996, 1545.5599999999995, 0.25185324628281147, 8.180424303998704, 0.37433656332269444], "isController": false}, {"data": ["5.4 Consent route", 1, 0, 0.0, 376.0, 376, 376, 376.0, 376.0, 376.0, 376.0, 2.6595744680851063, 30.374729886968083, 4.137404421542553], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 281.08571428571423, 259, 510, 269.0, 304.9, 327.65000000000003, 510.0, 0.07892713221647683, 0.4073534118789844, 0.04277788904311], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 500.2142857142857, 445, 728, 476.0, 573.8, 666.0500000000002, 728.0, 0.07868731571711685, 0.7635897033994045, 0.12379420470730006], "isController": false}, {"data": ["2.1 Open session", 899, 0, 0.0, 664.5850945495004, 307, 2099, 628.0, 939.0, 1038.0, 1344.0, 0.2539720207019685, 4.288844849739107, 0.1663896682790641], "isController": false}, {"data": ["3.3 Nurse triage complete", 1488, 0, 0.0, 311.36223118279594, 233, 1211, 291.0, 392.10000000000014, 497.54999999999995, 670.0899999999981, 0.4322889642553968, 10.477686159882422, 0.292844315763266], "isController": false}, {"data": ["4.3 Vaccination confirm", 1462, 0, 0.0, 871.9131326949378, 633, 1934, 821.0, 1084.0, 1179.0, 1537.2199999999993, 0.4359587872831239, 10.959916166552807, 1.014792993751655], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 342.0, 342, 342, 342.0, 342.0, 342.0, 342.0, 2.923976608187134, 35.24762426900585, 5.670915570175438], "isController": false}, {"data": ["4.1 Vaccination questions", 1476, 1, 0.06775067750677506, 452.33739837398434, 276, 1388, 469.5, 559.0, 608.4499999999996, 810.4500000000003, 0.42702822494550763, 4.9669790086587495, 0.8736083474542927], "isController": false}, {"data": ["5.3 Consent parent details", 2, 1, 50.0, 281.5, 245, 318, 281.5, 318.0, 318.0, 318.0, 0.0037663932265184215, 0.05144216373641274, 0.005020631595896138], "isController": false}, {"data": ["3.1 Nurse triage new", 1505, 0, 0.0, 295.46245847176107, 197, 1593, 239.0, 406.4000000000001, 432.0, 552.94, 0.4334975823508588, 4.88527038898631, 0.2987418074717701], "isController": false}, {"data": ["3.2 Nurse triage result", 1492, 0, 0.0, 735.1742627345841, 509, 2321, 698.0, 910.7, 973.6999999999998, 1186.2099999999998, 0.4325095263701812, 35.948760249272745, 0.7105761959236266], "isController": false}, {"data": ["5.2 Consent who", 2, 0, 0.0, 395.5, 391, 400, 395.5, 400.0, 400.0, 400.0, 0.0037556146438926193, 0.05617651318408522, 0.0058773168621464094], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1449.4571428571428, 1315, 2289, 1402.5, 1618.7, 1798.9, 2289.0, 0.07882874005772515, 3.7045658767557694, 0.37528330838028334], "isController": true}, {"data": ["5.0 Consent", 2, 1, 50.0, 2628.0, 1279, 3977, 2628.0, 3977.0, 3977.0, 3977.0, 0.0037237845567206864, 0.46615855141522433, 0.03661236612994519], "isController": true}, {"data": ["Already vaccinated", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 111.328125, 0.0], "isController": false}, {"data": ["5.9 Patient return to menacwy vaccination page", 638, 0, 0.0, 390.4498432601882, 232, 1430, 321.0, 562.0, 595.2499999999998, 767.0, 0.19104158687885658, 5.656909435489329, 0.13322222974352818], "isController": false}, {"data": ["4.0 Vaccination", 1474, 1, 0.06784260515603799, 1692.036635006785, 279, 2893, 1677.0, 1913.0, 2035.0, 2391.0, 0.4230808090085787, 22.785222856434817, 2.5258527731526237], "isController": true}, {"data": ["2.5 Patient return to consent page", 879, 0, 0.0, 372.02844141069403, 231, 1723, 304.0, 561.0, 612.0, 816.8000000000006, 0.2517776245024599, 5.751651963944242, 0.1745723763640103], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 594.0, 594, 594, 594.0, 594.0, 594.0, 594.0, 1.6835016835016834, 29.306739267676768, 2.5877262205387206], "isController": false}, {"data": ["Debug Sampler", 1462, 0, 0.0, 0.2489740082079343, 0, 1, 0.0, 1.0, 1.0, 1.0, 0.43626606381181954, 1.7574957958662745, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 898, 0, 0.0, 282.0957683741644, 196, 891, 230.0, 394.0, 413.04999999999995, 557.01, 0.25281382063901087, 2.9671059535543285, 0.16316085441217829], "isController": false}, {"data": ["4.2 Vaccination batch", 1473, 0, 0.0, 375.12559402579745, 309, 970, 349.0, 488.60000000000014, 517.0, 640.0, 0.43433018942752455, 7.514171547414084, 0.7021733592978063], "isController": false}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 477.0, 477, 477, 477.0, 477.0, 477.0, 477.0, 2.0964360587002098, 34.28000524109015, 3.4681276205450735], "isController": false}, {"data": ["2.2 Session register", 897, 0, 0.0, 720.7313266443709, 475, 1507, 690.0, 851.0, 932.1999999999998, 1124.3599999999997, 0.25383360909793984, 9.493541075856207, 0.16852766655460633], "isController": false}, {"data": ["5.1 Consent homepage", 2, 0, 0.0, 544.5, 456, 633, 544.5, 633.0, 633.0, 633.0, 0.0037210548446273547, 0.04697104972817694, 0.007925410757941662], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 2, 100.0, 0.012019953122182823], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16639, 2, "422/Unprocessable Entity", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1476, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 2, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
