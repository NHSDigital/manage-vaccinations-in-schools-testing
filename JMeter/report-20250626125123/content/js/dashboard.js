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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5626535626535627, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.85, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9117647058823529, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.85, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.38636363636363635, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.7222222222222222, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.08823529411764706, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.4, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.75, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9722222222222222, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6764705882352942, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.625, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [1.0, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.42857142857142855, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.75, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.53125, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.75, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.825, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.6451612903225806, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.5, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 338, 0, 0.0, 743.1065088757402, 105, 2683, 583.5, 1370.2, 1503.9, 2372.770000000001, 0.5652958520998733, 18.122524740055894, 0.6717232753459091], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 20, 0, 0.0, 5187.9, 4351, 7195, 4867.5, 6473.200000000001, 7160.2, 7195.0, 0.04103793135995601, 14.34441215343467, 0.17610041609897528], "isController": true}, {"data": ["2.5 Select patient", 20, 0, 0.0, 533.0999999999999, 369, 1531, 445.5, 771.9000000000001, 1493.1499999999994, 1531.0, 0.04104365813916263, 0.9546638646246762, 0.02845800515508346], "isController": false}, {"data": ["1.4 Select Organisations", 17, 0, 0.0, 558.6470588235294, 436, 1521, 459.0, 1204.1999999999998, 1521.0, 1521.0, 0.03118968465394128, 0.4481689648418866, 0.045078841101399494], "isController": false}, {"data": ["2.5 Select menacwy", 10, 0, 0.0, 498.5, 378, 751, 436.5, 743.0, 751.0, 751.0, 0.0302752321353424, 0.6843444220155434, 0.021109878656869602], "isController": false}, {"data": ["2.3 Search by first/last name", 22, 0, 0.0, 1345.4545454545455, 831, 2395, 1321.5, 1868.1, 2318.349999999999, 2395.0, 0.04230809911633766, 4.336127555914, 0.036469326027173336], "isController": false}, {"data": ["2.5 Select td_ipv", 9, 0, 0.0, 588.3333333333334, 374, 994, 551.0, 994.0, 994.0, 994.0, 0.037398090204193574, 0.8576157964338843, 0.026039881167568377], "isController": false}, {"data": ["5.8 Consent confirm", 1, 0, 0.0, 2218.0, 2218, 2218, 2218.0, 2218.0, 2218.0, 2218.0, 0.45085662759242556, 34.240447475202885, 0.9796445277276826], "isController": false}, {"data": ["4.0 Vaccination for hpv", 17, 0, 0.0, 2308.294117647059, 1100, 3335, 2396.0, 3140.6, 3335.0, 3335.0, 0.04278451703830472, 2.0032262396499223, 0.23240732511828663], "isController": true}, {"data": ["1.2 Sign-in page", 18, 0, 0.0, 109.1111111111111, 105, 122, 107.0, 119.30000000000001, 122.0, 122.0, 0.03092937620603089, 0.18639177789786776, 0.018636157342891656], "isController": false}, {"data": ["5.9 Patient home page", 1, 0, 0.0, 754.0, 754, 754, 754.0, 754.0, 754.0, 754.0, 1.3262599469496021, 28.684256879973475, 0.9882190815649867], "isController": false}, {"data": ["2.4 Patient attending session", 20, 0, 0.0, 1448.2499999999998, 1028, 2683, 1358.0, 2434.3000000000006, 2671.8999999999996, 2683.0, 0.041197869246202584, 3.6178126132941406, 0.061233551750703455], "isController": false}, {"data": ["5.4 Consent route", 2, 0, 0.0, 662.0, 474, 850, 662.0, 850.0, 850.0, 850.0, 0.004552127550613968, 0.05175600098439758, 0.0070815812384063], "isController": false}, {"data": ["1.1 Homepage", 18, 0, 0.0, 355.0555555555555, 309, 543, 350.5, 394.5000000000002, 543.0, 543.0, 0.03088840191988578, 0.15941914467441048, 0.016741272524938094], "isController": false}, {"data": ["1.3 Sign-in", 17, 0, 0.0, 593.1764705882351, 468, 762, 614.0, 711.5999999999999, 762.0, 762.0, 0.031168869266761514, 0.30246587295293864, 0.04903618006714141], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 5, 0, 0.0, 2597.8, 2247, 3095, 2565.0, 3095.0, 3095.0, 3095.0, 0.031204168876961962, 1.7315388335881672, 0.1849517408025712], "isController": true}, {"data": ["2.1 Open session", 24, 0, 0.0, 680.5, 431, 1463, 724.5, 841.5, 1308.0, 1463.0, 0.04451575208435735, 0.7790781906433454, 0.027807854248008385], "isController": false}, {"data": ["5.6 Consent questions", 1, 0, 0.0, 482.0, 482, 482, 482.0, 482.0, 482.0, 482.0, 2.074688796680498, 25.291347899377595, 5.111757650414938], "isController": false}, {"data": ["4.3 Vaccination confirm", 28, 0, 0.0, 1286.392857142857, 971, 2338, 1220.0, 1813.2, 2126.949999999999, 2338.0, 0.07872355380614325, 1.5760882696633163, 0.18330847596120053], "isController": false}, {"data": ["5.3 Consent parent details", 2, 0, 0.0, 592.0, 473, 711, 592.0, 711.0, 711.0, 711.0, 0.004540954871990482, 0.051340727568818176, 0.008208308074271859], "isController": false}, {"data": ["4.1 Vaccination questions", 32, 0, 0.0, 688.125, 496, 1525, 697.5, 866.0999999999999, 1266.9499999999991, 1525.0, 0.07866157332979357, 0.9123162937309185, 0.1538591375557391], "isController": false}, {"data": ["5.2 Consent who", 2, 0, 0.0, 632.0, 476, 788, 632.0, 788.0, 788.0, 788.0, 0.004516895447421078, 0.08646502398471483, 0.007106170474409529], "isController": false}, {"data": ["1.0 Login", 17, 0, 0.0, 1988.3529411764707, 1741, 2779, 1934.0, 2470.2, 2779.0, 2779.0, 0.03090594412205303, 1.4564124351656922, 0.1471352320263755], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 9, 0, 0.0, 2511.3333333333335, 2163, 3824, 2366.0, 3824.0, 3824.0, 3824.0, 0.03632415677506064, 1.892084177954062, 0.21533177702819964], "isController": true}, {"data": ["2.5 Select hpv", 20, 0, 0.0, 518.5500000000001, 369, 967, 425.0, 865.7, 961.9999999999999, 967.0, 0.04096564211595735, 0.7907049022047709, 0.030524204037573686], "isController": false}, {"data": ["5.1 Consent start", 2, 0, 0.0, 639.5, 631, 648, 639.5, 648.0, 648.0, 648.0, 0.004532958004410568, 0.05178594649862991, 0.00963696247617364], "isController": false}, {"data": ["5.5 Consent agree", 1, 0, 0.0, 505.0, 505, 505, 505.0, 505.0, 505.0, 505.0, 1.9801980198019802, 31.213258044554454, 3.0437809405940595], "isController": false}, {"data": ["1.5 Open Sessions list", 17, 0, 0.0, 369.52941176470586, 334, 441, 362.0, 413.0, 441.0, 441.0, 0.031116097821690118, 0.3691390198612222, 0.018596730338744483], "isController": false}, {"data": ["4.2 Vaccination batch", 31, 0, 0.0, 558.4838709677418, 475, 1115, 516.0, 707.8000000000001, 922.3999999999995, 1115.0, 0.077537217864575, 1.5559934588915179, 0.12386072267813551], "isController": false}, {"data": ["5.0 Consent for hpv", 1, 0, 0.0, 6869.0, 6869, 6869, 6869.0, 6869.0, 6869.0, 6869.0, 0.14558159848595137, 28.3521584746688, 2.274570306813219], "isController": true}, {"data": ["5.7 Consent triage", 1, 0, 0.0, 527.0, 527, 527, 527.0, 527.0, 527.0, 527.0, 1.8975332068311195, 30.336441532258064, 3.1224057163187853], "isController": false}, {"data": ["2.2 Session register", 22, 0, 0.0, 1175.1363636363635, 786, 1476, 1185.0, 1432.6999999999998, 1473.6, 1476.0, 0.04228126651611973, 4.8179510702445585, 0.026651011387113822], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 338, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
