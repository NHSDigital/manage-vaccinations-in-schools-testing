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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.39224298369686594, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.7616361071932299, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.665680473372781, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.3729050279329609, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.7059426229508197, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.001447178002894356, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.2857142857142857, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.7, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.3080168776371308, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9071428571428571, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.003105590062111801, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4439058171745152, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.24909310761789602, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.49791044776119403, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.5, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.002012072434607646, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7177304964539007, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9295774647887324, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4979066985645933, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.3150208623087622, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10944, 0, 0.0, 998.164747807015, 154, 5806, 914.0, 1652.5, 1856.0, 2396.0, 3.038835113206604, 107.15795435968295, 4.187221938187584], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 713, 0, 0.0, 5999.197755960731, 4115, 9514, 5862.0, 7044.6, 7421.2, 8470.140000000003, 0.20312452815568058, 71.41173256391016, 0.8840270406323127], "isController": true}, {"data": ["2.5 Select patient", 709, 0, 0.0, 575.9971791255289, 406, 2374, 495.0, 902.0, 997.0, 1236.6999999999998, 0.20261947833343336, 5.116426493639921, 0.14048811486009538], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 608.7285714285714, 544, 1190, 578.0, 665.5, 849.6000000000004, 1190.0, 0.07833815672555458, 1.1256519902927833, 0.1132231171424031], "isController": false}, {"data": ["2.5 Select menacwy", 507, 0, 0.0, 712.0335305719921, 411, 4139, 595.0, 1007.2, 1120.0, 1433.960000000001, 0.15058903480151206, 3.4044449225431785, 0.10500055746902306], "isController": false}, {"data": ["2.3 Search by first/last name", 716, 0, 0.0, 1356.6270949720679, 784, 3067, 1252.5, 1916.1000000000004, 2168.15, 2689.4500000000007, 0.2028603881376538, 23.31224232073559, 0.1749894408476391], "isController": false}, {"data": ["2.5 Select td_ipv", 488, 0, 0.0, 629.3381147540981, 412, 2242, 522.0, 947.0, 1045.099999999999, 1335.1600000000008, 0.14965726033984467, 3.4334845738018833, 0.10420471349834887], "isController": false}, {"data": ["4.0 Vaccination for hpv", 691, 0, 0.0, 3012.1765557163503, 1285, 4356, 2948.0, 3474.8, 3665.8, 4112.560000000001, 0.20089375918158614, 10.073913040476167, 1.1839374723444012], "isController": true}, {"data": ["5.8 Consent confirm", 35, 0, 0.0, 1507.3142857142857, 1125, 2214, 1428.0, 1900.6, 2040.3999999999992, 2214.0, 0.01160840408655624, 0.8854825210394033, 0.025326337632257036], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 162.0142857142857, 154, 192, 160.0, 170.0, 177.9, 192.0, 0.07909148738321295, 0.4766343443767647, 0.0476557106596117], "isController": false}, {"data": ["5.9 Patient home page", 35, 0, 0.0, 566.5428571428572, 419, 1161, 519.0, 820.8, 971.399999999999, 1161.0, 0.011632138601916645, 0.2516219173794121, 0.008667306399670312], "isController": false}, {"data": ["2.4 Patient attending session", 711, 0, 0.0, 1521.7271448663869, 974, 4585, 1406.0, 2006.4, 2289.6, 2968.12, 0.20293563087293146, 19.64513454466425, 0.3016289357310563], "isController": false}, {"data": ["5.4 Consent route", 35, 0, 0.0, 641.3428571428573, 565, 936, 606.0, 784.4, 850.3999999999995, 936.0, 0.011607129828731825, 0.1319647105737305, 0.018159782111787936], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 483.7428571428572, 455, 706, 471.0, 512.0, 526.95, 706.0, 0.07891076094774079, 0.40726891758672856, 0.0427690159433556], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 662.785714285714, 555, 1028, 627.0, 791.9, 903.0000000000002, 1028.0, 0.0784229371406549, 0.7610241468424684, 0.1233782731773389], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 483, 0, 0.0, 3036.1449275362315, 1230, 7118, 2968.0, 3449.6000000000004, 3699.7999999999993, 4216.599999999984, 0.15031589679304302, 8.294751345451761, 0.8857925374537109], "isController": true}, {"data": ["2.1 Open session", 722, 0, 0.0, 1103.8919667590028, 513, 2897, 1083.5, 1527.7, 1721.85, 2039.9399999999996, 0.20350806182247952, 3.5635546322606504, 0.1331271628016577], "isController": false}, {"data": ["4.3 Vaccination confirm", 1654, 0, 0.0, 1520.5955259975826, 1033, 5806, 1505.0, 1939.0, 2135.75, 2598.350000000002, 0.4867097917829616, 9.991637675549512, 1.133105716257902], "isController": false}, {"data": ["5.6 Consent questions", 35, 0, 0.0, 731.4000000000002, 564, 1105, 703.0, 920.9999999999999, 1001.7999999999995, 1105.0, 0.011604385927394342, 0.14143654806735584, 0.028694628740052137], "isController": false}, {"data": ["4.1 Vaccination questions", 1675, 0, 0.0, 821.1134328358219, 560, 2048, 872.0, 1047.0, 1161.3999999999996, 1413.72, 0.48625170478396196, 5.639952784233717, 0.9604888647633856], "isController": false}, {"data": ["5.3 Consent parent details", 35, 0, 0.0, 670.3714285714286, 576, 1118, 626.0, 807.0, 914.7999999999989, 1118.0, 0.011612825735614446, 0.13129232667608742, 0.021109162137941125], "isController": false}, {"data": ["5.2 Consent who", 35, 0, 0.0, 733.8000000000002, 568, 1242, 662.0, 1047.0, 1192.3999999999996, 1242.0, 0.011606860384061063, 0.22477281021655748, 0.018357881912134076], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2370.142857142857, 2139, 2857, 2334.0, 2603.8, 2653.8, 2857.0, 0.07873289527850073, 3.7102108024063023, 0.3748270160963781], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 497, 0, 0.0, 3059.0462776659997, 1272, 5403, 2990.0, 3508.6, 3732.599999999999, 4276.919999999999, 0.14994050650325463, 7.783873515754915, 0.8853966756990486], "isController": true}, {"data": ["2.5 Select hpv", 705, 0, 0.0, 638.8212765957444, 400, 1679, 515.0, 973.0, 1085.3999999999999, 1373.919999999999, 0.20223711541600461, 4.078024085382645, 0.15069035064688624], "isController": false}, {"data": ["5.1 Consent start", 35, 0, 0.0, 1025.3714285714289, 732, 1448, 1077.0, 1330.8, 1411.1999999999998, 1448.0, 0.011611130628868786, 0.1330271426351096, 0.02478801444772984], "isController": false}, {"data": ["5.5 Consent agree", 35, 0, 0.0, 681.0285714285712, 578, 1765, 625.0, 791.8, 1036.1999999999962, 1765.0, 0.011604670647842343, 0.1829111738928398, 0.017940613595302694], "isController": false}, {"data": ["1.5 Open Sessions list", 71, 0, 0.0, 452.70422535211264, 388, 756, 436.0, 557.5999999999999, 602.8, 756.0, 0.04303340665175246, 0.5105174062553602, 0.02575055507791168], "isController": false}, {"data": ["4.2 Vaccination batch", 1672, 0, 0.0, 707.6883971291876, 553, 4033, 637.0, 926.0, 998.3499999999999, 1285.08, 0.48639051980659576, 9.828889107834117, 0.7864806935035739], "isController": false}, {"data": ["5.0 Consent for hpv", 35, 0, 0.0, 7406.257142857144, 6574, 8149, 7424.0, 7996.0, 8065.799999999999, 8149.0, 0.011591657053871067, 2.2645411412541114, 0.18197413806094098], "isController": true}, {"data": ["5.7 Consent triage", 35, 0, 0.0, 849.0857142857143, 574, 1238, 806.0, 1134.8, 1212.3999999999999, 1238.0, 0.011591968024715401, 0.1854831321133284, 0.01917752678821011], "isController": false}, {"data": ["2.2 Session register", 719, 0, 0.0, 1456.8678720445066, 797, 3402, 1364.0, 1984.0, 2265.0, 2786.399999999998, 0.20294544690901947, 19.777714314202456, 0.13453857272475292], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10944, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
