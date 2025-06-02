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

    var data = {"OkPercent": 99.96084573218481, "KoPercent": 0.03915426781519186};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8142361111111112, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9918032786885246, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9918032786885246, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9836065573770492, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9180327868852459, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9836065573770492, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8316326530612245, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.9795918367346939, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.935, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9836065573770492, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.45652173913043476, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.5612244897959183, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9932432432432432, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9918032786885246, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8278688524590164, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.175, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.95, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5769230769230769, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9102564102564102, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9895833333333334, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5760869565217391, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.4262295081967213, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9565217391304348, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.967391304347826, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.38, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9744897959183674, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9919354838709677, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.972972972972973, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9461538461538461, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9846153846153847, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9846153846153847, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.66, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9675324675324676, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.987012987012987, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2554, 1, 0.03915426781519186, 386.09749412685966, 0, 4334, 248.0, 765.0, 1331.5, 2419.1999999999935, 4.258107326312069, 118.97514420764442, 3.9327091473240112], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 61, 0, 0.0, 108.11475409836063, 88, 841, 95.0, 104.80000000000001, 118.6, 841.0, 0.11823355196849172, 0.08578860264901304, 0.0944482866310803], "isController": false}, {"data": ["1.4 Select Organisations-1", 61, 0, 0.0, 127.4754098360656, 95, 828, 107.0, 155.60000000000005, 235.39999999999992, 828.0, 0.1182301145669192, 1.6127326565143825, 0.07643392172197316], "isController": false}, {"data": ["2.0 Register attendance", 98, 0, 0.0, 3869.816326530613, 2758, 7141, 3572.5, 5160.200000000002, 6491.9, 7141.0, 0.1963648458836518, 58.93589351515115, 0.8457510930308513], "isController": true}, {"data": ["1.3 Sign-in-1", 61, 0, 0.0, 130.327868852459, 90, 1713, 100.0, 111.80000000000001, 174.49999999999991, 1713.0, 0.1180162436783922, 1.0614546916777265, 0.07790916086581359], "isController": false}, {"data": ["1.3 Sign-in-0", 61, 0, 0.0, 438.1147540983607, 318, 2014, 360.0, 623.4000000000001, 751.2999999999998, 2014.0, 0.11796375225291428, 0.08374965614049677, 0.10771104331686998], "isController": false}, {"data": ["1.4 Select Organisations", 61, 0, 0.0, 235.91803278688533, 188, 964, 201.0, 262.00000000000006, 384.29999999999995, 964.0, 0.11820903620878428, 1.6982159488939705, 0.17084899764550854], "isController": false}, {"data": ["2.4 Patient attending session-1", 98, 0, 0.0, 540.2959183673472, 256, 4096, 410.0, 899.1000000000001, 1151.6499999999994, 4096.0, 0.1970407693436733, 22.334562958421383, 0.13161707639753176], "isController": false}, {"data": ["2.4 Patient attending session-0", 98, 0, 0.0, 239.08163265306118, 146, 2148, 209.0, 343.1, 487.25, 2148.0, 0.19711408883006754, 0.14648810703093887, 0.16131016253866856], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 371.76, 189, 3308, 236.0, 499.9, 709.3499999999985, 3301.159999999996, 0.19259807093772147, 6.412547129349828, 0.16610831282163876], "isController": false}, {"data": ["1.2 Sign-in page", 61, 0, 0.0, 116.03278688524591, 85, 1573, 89.0, 96.4, 152.09999999999994, 1573.0, 0.11829958886044527, 0.7129167606033279, 0.07128012336610814], "isController": false}, {"data": ["3.0 Nurse triage", 92, 0, 0.0, 1180.6630434782617, 640, 4158, 1072.5, 1391.7, 1898.7499999999989, 4158.0, 0.20020847795856989, 22.617025221643843, 0.5928196664298259], "isController": true}, {"data": ["4.2 Vaccination batch-2", 74, 0, 0.0, 0.5405405405405402, 0, 5, 0.0, 1.0, 1.0, 5.0, 0.18507541823292992, 0.8719397881199089, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 98, 0, 0.0, 779.622448979592, 417, 4334, 609.5, 1071.5, 1509.599999999999, 4334.0, 0.19697106736209513, 22.473044060342488, 0.2927636372315515], "isController": false}, {"data": ["4.2 Vaccination batch-0", 74, 0, 0.0, 184.7702702702703, 98, 1259, 117.5, 274.5, 300.0, 1259.0, 0.18494821449994, 0.1383499338935098, 0.16616441146478986], "isController": false}, {"data": ["4.2 Vaccination batch-1", 74, 0, 0.0, 154.78378378378375, 111, 369, 140.0, 207.5, 270.25, 369.0, 0.18500971300993302, 2.516885066153473, 0.12712581473027335], "isController": false}, {"data": ["1.1 Homepage", 61, 0, 0.0, 276.90163934426226, 246, 509, 259.0, 354.20000000000005, 372.4, 509.0, 0.11868697186729629, 0.6125592249205672, 0.06432741151010687], "isController": false}, {"data": ["1.3 Sign-in", 61, 0, 0.0, 568.8196721311473, 418, 2139, 457.0, 750.2, 1374.9999999999993, 2139.0, 0.11794094445561554, 1.1445109033744645, 0.1855496694511686], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1843.75, 1190, 3790, 1695.0, 2616.1, 2878.3999999999996, 3789.4799999999996, 0.1905429712508765, 3.2637926911527084, 0.11958618294316484], "isController": false}, {"data": ["3.3 Nurse triage complete", 90, 0, 0.0, 278.85555555555555, 141, 2012, 199.5, 455.30000000000007, 782.4500000000002, 2012.0, 0.19908068961550882, 4.622141222034694, 0.13453499727923057], "isController": false}, {"data": ["4.3 Vaccination confirm", 65, 0, 0.0, 735.8461538461538, 417, 2323, 697.0, 1089.1999999999998, 1305.4999999999993, 2323.0, 0.1810574871449184, 4.39400352835778, 0.42115995349608076], "isController": false}, {"data": ["4.1 Vaccination questions", 78, 1, 1.2820512820512822, 382.3205128205128, 224, 1832, 289.0, 549.8000000000006, 718.3999999999996, 1832.0, 0.17270430587261063, 1.993470673618753, 0.34560321545526407], "isController": false}, {"data": ["3.1 Nurse triage new", 96, 0, 0.0, 165.88541666666654, 107, 1158, 128.0, 247.29999999999978, 372.04999999999995, 1158.0, 0.1993024414549078, 2.244372479524788, 0.13702042850024912], "isController": false}, {"data": ["3.2 Nurse triage result", 92, 0, 0.0, 741.1086956521737, 376, 2849, 733.0, 874.4, 1162.599999999998, 2849.0, 0.19887505890592777, 15.709825042639245, 0.3206704109309947], "isController": false}, {"data": ["1.0 Login", 61, 0, 0.0, 1320.6229508196725, 1055, 2789, 1160.0, 1844.0000000000011, 2581.499999999999, 2789.0, 0.11812502662654288, 5.4549768155429295, 0.5623627976605435], "isController": true}, {"data": ["3.2 Nurse triage result-1", 92, 0, 0.0, 383.19565217391323, 177, 2676, 358.0, 457.5, 531.8499999999999, 2676.0, 0.1990497537841089, 15.576086937413997, 0.135936056483613], "isController": false}, {"data": ["3.2 Nurse triage result-0", 92, 0, 0.0, 357.80434782608677, 160, 1662, 338.5, 432.0, 586.999999999999, 1662.0, 0.19903812661853693, 0.14752923642916946, 0.1850052288073073], "isController": false}, {"data": ["4.0 Vaccination", 75, 1, 1.3333333333333333, 1359.6266666666663, 249, 3187, 1288.0, 1914.2000000000003, 2427.2, 3187.0, 0.16677970624534405, 8.569299834471142, 0.9307132820578392], "isController": true}, {"data": ["2.5 Patient return to consent page", 98, 0, 0.0, 253.11224489795933, 142, 988, 196.5, 469.1000000000001, 533.1, 988.0, 0.1967970279632512, 4.4470103920879565, 0.13645106431045734], "isController": false}, {"data": ["1.5 Open Sessions list", 124, 0, 0.0, 144.08064516129028, 101, 2085, 121.0, 156.0, 271.25, 1645.0, 0.22427161462902037, 2.4494665410263323, 0.1399348476264286], "isController": false}, {"data": ["4.2 Vaccination batch", 74, 0, 0.0, 340.6081081081081, 213, 1379, 303.5, 441.5, 505.0, 1379.0, 0.1848844472204872, 3.524523247189257, 0.29314686133666457], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 65, 0, 0.0, 334.8307692307692, 173, 948, 294.0, 524.2, 725.6999999999999, 948.0, 0.18119325515076673, 0.13660272751600772, 0.17375061152723614], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 65, 0, 0.0, 139.8769230769231, 93, 1295, 109.0, 147.79999999999998, 180.59999999999997, 1295.0, 0.18123013438911503, 0.13539165313249316, 0.12229494420202977], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 65, 0, 0.0, 260.9230769230769, 142, 1945, 225.0, 353.0, 368.2, 1945.0, 0.1812068936677948, 4.125642108370085, 0.1254645386820962], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 642.0999999999999, 336, 2194, 571.0, 896.2, 1213.3999999999978, 2187.839999999997, 0.19109278318995007, 21.575461315893566, 0.1216107754115183], "isController": false}, {"data": ["4.1 Vaccination questions-0", 77, 0, 0.0, 233.74025974025977, 112, 1719, 152.0, 316.2, 522.2999999999995, 1719.0, 0.18711119751166408, 0.13960249501846814, 0.24786395937621503], "isController": false}, {"data": ["4.1 Vaccination questions-1", 77, 0, 0.0, 150.15584415584414, 105, 524, 126.0, 226.2, 349.89999999999986, 524.0, 0.18712074634446257, 2.0374204660886175, 0.12832987975061907], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.03915426781519186], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2554, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 78, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
