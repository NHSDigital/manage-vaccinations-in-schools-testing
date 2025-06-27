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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32573485302939414, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6726768377253814, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.5857438016528925, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.28746594005449594, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.6446808510638298, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [7.173601147776184E-4, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.20967741935483872, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5806451612903226, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.1814404432132964, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.46774193548387094, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9142857142857143, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.001075268817204301, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.05495251017639077, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.18097591105620753, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.46774193548387094, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.47144592952612396, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.46774193548387094, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0021008403361344537, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6418636995827538, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.46875, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9487179487179487, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.48048780487804876, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.41935483870967744, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.22312925170068026, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10866, 0, 0.0, 1238.1149457021988, 155, 7626, 1009.0, 2171.600000000002, 2684.949999999999, 3888.0, 3.017763311374518, 110.30446500513445, 4.131833474857527], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 731, 0, 0.0, 8150.600547195622, 4000, 15653, 7890.0, 10405.600000000002, 11328.8, 14386.159999999987, 0.20825012349716626, 75.55674613775788, 0.9036002303962848], "isController": true}, {"data": ["2.5 Select patient", 721, 0, 0.0, 695.8890429958388, 436, 4986, 540.0, 1012.6000000000001, 1278.8, 2662.239999999997, 0.20605062958326903, 5.209861889725047, 0.14286713574621193], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 607.1571428571428, 544, 1057, 574.0, 714.4, 751.3000000000001, 1057.0, 0.07857911008035276, 1.1291142829319438, 0.11357137003800984], "isController": false}, {"data": ["2.5 Select menacwy", 484, 0, 0.0, 804.9318181818186, 437, 3849, 734.0, 1133.5, 1304.75, 2700.4499999999907, 0.14368353523244967, 3.2496551265817804, 0.10018558999606354], "isController": false}, {"data": ["2.3 Search by first/last name", 734, 0, 0.0, 1603.9155313351484, 795, 6902, 1414.0, 2316.0, 2759.75, 4497.199999999994, 0.20843301817541598, 24.924167326154368, 0.17983066015266158], "isController": false}, {"data": ["2.5 Select td_ipv", 470, 0, 0.0, 705.2872340425536, 441, 2902, 569.5, 1019.9000000000001, 1179.7999999999997, 2142.5200000000123, 0.1439326566661032, 3.3022110424636555, 0.10021873457317536], "isController": false}, {"data": ["4.0 Vaccination for hpv", 697, 0, 0.0, 3483.826398852226, 1356, 9772, 3237.0, 4529.2, 5278.200000000001, 6594.239999999997, 0.20319840706442438, 10.161086484682134, 1.1948101524316028], "isController": true}, {"data": ["5.8 Consent confirm", 31, 0, 0.0, 1662.4838709677424, 1205, 2776, 1640.0, 2131.4, 2681.2, 2776.0, 0.009917258076487013, 0.7690058227701205, 0.021648077239604793], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 161.25714285714287, 155, 186, 159.0, 167.9, 178.25, 186.0, 0.07889519674771459, 0.47545142493178383, 0.04753743788412099], "isController": false}, {"data": ["5.9 Patient home page", 31, 0, 0.0, 680.1612903225807, 453, 1952, 540.0, 974.6, 1706.5999999999995, 1952.0, 0.009924401670628958, 0.21474711964250384, 0.00739484226043935], "isController": false}, {"data": ["2.4 Patient attending session", 722, 0, 0.0, 1860.9612188365654, 1106, 6542, 1625.5, 2712.500000000001, 3399.9500000000016, 4803.0, 0.20616490165334544, 20.717338992029244, 0.3064286917152263], "isController": false}, {"data": ["5.4 Consent route", 31, 0, 0.0, 740.741935483871, 578, 1903, 637.0, 1020.8000000000001, 1679.1999999999994, 1903.0, 0.009920250783939818, 0.11281566447999807, 0.015531955147826139], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 481.4, 460, 681, 470.0, 515.0, 524.45, 681.0, 0.07891200634903457, 0.40727534526821063, 0.042769690941127134], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 666.6999999999999, 586, 1172, 627.0, 788.5, 964.25, 1172.0, 0.07855362575481617, 0.7622923624273519, 0.12358387801856334], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 465, 0, 0.0, 3600.4430107526887, 1406, 10069, 3303.0, 4829.0, 5530.0, 7142.44, 0.14540837864967213, 8.031711925675992, 0.8573680003650845], "isController": true}, {"data": ["2.1 Open session", 737, 0, 0.0, 2334.0949796472196, 1140, 7626, 2184.0, 3288.2, 3723.6000000000004, 4767.26, 0.20791182056278937, 3.6497556846568693, 0.1360291671262637], "isController": false}, {"data": ["4.3 Vaccination confirm", 1619, 0, 0.0, 1796.7875231624478, 1132, 7280, 1664.0, 2456.0, 3001.0, 4525.399999999999, 0.4774471822211527, 9.78129400037777, 1.1114256853202833], "isController": false}, {"data": ["5.6 Consent questions", 31, 0, 0.0, 835.0, 583, 2617, 685.0, 1169.2, 2462.7999999999997, 2617.0, 0.009902185572068426, 0.12069006125220484, 0.024496866657009377], "isController": false}, {"data": ["4.1 Vaccination questions", 1646, 0, 0.0, 941.9945321992711, 585, 5820, 907.0, 1221.0999999999997, 1581.6499999999971, 3085.3099999999968, 0.47822812701925, 5.546970912104663, 0.9446218738305783], "isController": false}, {"data": ["5.3 Consent parent details", 31, 0, 0.0, 746.1935483870968, 578, 1732, 636.0, 1079.4, 1650.9999999999998, 1732.0, 0.009919225506872423, 0.11214530619449233, 0.018066714350943477], "isController": false}, {"data": ["5.2 Consent who", 32, 0, 0.0, 690.1249999999999, 587, 1128, 621.5, 975.2, 1091.6, 1128.0, 0.009943431198447582, 0.19272437973963746, 0.01575084655110535], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2372.842857142857, 2192, 2875, 2310.0, 2687.6, 2800.45, 2875.0, 0.0787287334008901, 3.7100146779882333, 0.3748072024700578], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 476, 0, 0.0, 3546.3781512605037, 1323, 9086, 3242.0, 4690.4, 5386.349999999999, 7602.130000000003, 0.1438757155625465, 7.476356285540097, 0.8501461313301159], "isController": true}, {"data": ["2.5 Select hpv", 719, 0, 0.0, 725.9624478442284, 438, 5067, 573.0, 1040.0, 1238.0, 2890.1999999999907, 0.20645156844328913, 4.1676019559204365, 0.15383061203342735], "isController": false}, {"data": ["5.1 Consent start", 32, 0, 0.0, 1035.4375, 767, 2008, 1071.0, 1211.8999999999999, 1761.6499999999992, 2008.0, 0.009941262670838268, 0.11393072924287653, 0.02124744662939936], "isController": false}, {"data": ["5.5 Consent agree", 31, 0, 0.0, 842.1612903225807, 578, 1405, 748.0, 1201.8, 1395.4, 1405.0, 0.009912678891877615, 0.15624273036905864, 0.015336173315835856], "isController": false}, {"data": ["1.5 Open Sessions list", 78, 0, 0.0, 452.8076923076924, 392, 1018, 421.5, 508.90000000000015, 675.55, 1018.0, 0.025414094982899246, 0.3014945564963477, 0.015323803264929233], "isController": false}, {"data": ["4.2 Vaccination batch", 1640, 0, 0.0, 816.7920731707334, 579, 4952, 688.0, 1066.9, 1319.749999999999, 2629.349999999995, 0.4773701793252722, 9.648089193961907, 0.7718748562795573], "isController": false}, {"data": ["5.0 Consent for hpv", 31, 0, 0.0, 8265.451612903224, 6902, 10287, 7931.0, 10027.0, 10252.2, 10287.0, 0.009921828791482847, 1.9512205864784997, 0.15587498087647517], "isController": true}, {"data": ["5.7 Consent triage", 31, 0, 0.0, 1029.7096774193549, 613, 2731, 1055.0, 1652.2, 2150.799999999999, 2731.0, 0.009910001205184017, 0.15863588024227077, 0.016406259240676527], "isController": false}, {"data": ["2.2 Session register", 735, 0, 0.0, 1688.5469387755097, 800, 5445, 1547.0, 2397.0, 2838.2, 3750.7599999999998, 0.20766953250621525, 21.052024272895284, 0.13769308940074484], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10866, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
