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

    var data = {"OkPercent": 95.13422818791946, "KoPercent": 4.865771812080537};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7097625329815304, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Prevent multiple runs"], "isController": false}, {"data": [0.005, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Completed sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "Scheduled sessions list"], "isController": false}, {"data": [0.9523809523809523, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9074074074074074, 500, 1500, "5.9 Patient return to td_ipv vaccination page"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4791666666666667, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [0.8690476190476191, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Get school name"], "isController": false}, {"data": [0.36, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9322916666666666, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.49444444444444446, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9247311827956989, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9947916666666666, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.6614583333333334, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.4142857142857143, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9814814814814815, 500, 1500, "5.9 Patient return to menacwy vaccination page"], "isController": false}, {"data": [0.24731182795698925, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9523809523809523, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9623655913978495, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6190476190476191, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1192, 58, 4.865771812080537, 344.83808724832244, 0, 4875, 288.0, 708.5000000000002, 870.7999999999993, 1050.07, 1.997252102811568, 58.884238154929456, 2.140709366412821], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Prevent multiple runs", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 0.0, 0.0], "isController": false}, {"data": ["2.0 Register attendance", 100, 58, 58.0, 938.0000000000001, 106, 2619, 312.5, 2164.4, 2275.0, 2617.8499999999995, 0.4188797480019436, 35.10899921905107, 0.9045839058023223], "isController": true}, {"data": ["Completed sessions list", 1, 0, 0.0, 178.0, 178, 178, 178.0, 178.0, 178.0, 178.0, 5.617977528089887, 235.26926790730337, 3.4234550561797756], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 255.94285714285718, 237, 296, 253.0, 275.59999999999997, 284.79999999999995, 296.0, 0.519434261883914, 7.464838474495778, 0.7527738717145783], "isController": false}, {"data": ["Scheduled sessions list", 1, 0, 0.0, 144.0, 144, 144, 144.0, 144.0, 144.0, 144.0, 6.944444444444444, 103.51562500000001, 4.231770833333334], "isController": false}, {"data": ["2.3 Search by first/last name", 42, 0, 0.0, 273.02380952380963, 193, 544, 226.0, 503.20000000000005, 537.1, 544.0, 0.18049688213123843, 4.260663148768109, 0.15633997984451484], "isController": false}, {"data": ["5.9 Patient return to td_ipv vaccination page", 27, 0, 0.0, 292.81481481481484, 178, 554, 232.0, 538.8, 550.8, 554.0, 0.11026574043444702, 3.234732916978065, 0.07677682903296945], "isController": false}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 112.11428571428571, 103, 144, 109.0, 129.6, 138.39999999999998, 144.0, 0.6137013203345549, 3.6989888174852275, 0.3709776536006733], "isController": false}, {"data": ["3.0 Nurse triage", 96, 0, 0.0, 1104.9583333333335, 747, 1742, 1153.0, 1290.2, 1488.7499999999984, 1742.0, 0.21161455290914902, 17.472569584127807, 0.6346434618542726], "isController": true}, {"data": ["2.4 Patient attending session", 42, 0, 0.0, 478.11904761904754, 382, 774, 474.5, 524.4, 617.2500000000001, 774.0, 0.18121257097492363, 4.327157993631673, 0.26987223704761576], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 329.94285714285706, 306, 576, 319.0, 340.79999999999995, 451.19999999999936, 576.0, 0.5999520038396928, 3.0970178635709145, 0.32634108021358293], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 530.3714285714287, 459, 735, 503.0, 679.9999999999999, 721.4, 735.0, 0.5181040352902864, 5.029252061313912, 0.8171269697205199], "isController": false}, {"data": ["Get school name", 1, 0, 0.0, 4875.0, 4875, 4875, 4875.0, 4875.0, 4875.0, 4875.0, 0.20512820512820512, 2045.7750400641025, 0.12880608974358973], "isController": false}, {"data": ["2.1 Open session", 100, 58, 58.0, 242.72000000000006, 106, 711, 176.0, 510.70000000000005, 542.4999999999999, 709.8899999999994, 0.4255409689567863, 4.143792454360731, 0.2612090150854273], "isController": false}, {"data": ["3.3 Nurse triage complete", 96, 0, 0.0, 282.0416666666666, 180, 751, 235.5, 550.2, 582.0499999999997, 751.0, 0.21011714030572046, 5.073825361740734, 0.1423971964956401], "isController": false}, {"data": ["4.3 Vaccination confirm", 90, 0, 0.0, 813.877777777778, 562, 2064, 794.5, 1021.8, 1106.2, 2064.0, 0.25035536553274235, 6.487102504353402, 0.5838338194979541], "isController": false}, {"data": ["4.1 Vaccination questions", 93, 0, 0.0, 364.2580645161289, 272, 650, 311.0, 538.0, 594.6, 650.0, 0.22666783656517797, 3.1991982996256327, 0.48360898686179604], "isController": false}, {"data": ["3.1 Nurse triage new", 96, 0, 0.0, 179.4270833333333, 135, 880, 160.0, 251.79999999999967, 358.0, 880.0, 0.21252573553828782, 2.3857475274512407, 0.14652004673905825], "isController": false}, {"data": ["3.2 Nurse triage result", 96, 0, 0.0, 643.4791666666662, 403, 1372, 583.5, 883.9, 900.2999999999998, 1372.0, 0.21184710817663635, 9.998041776222149, 0.3457191195601083], "isController": false}, {"data": ["1.0 Login", 35, 0, 0.0, 1531.7999999999997, 1269, 6611, 1351.0, 1592.0, 2622.9999999999786, 6611.0, 0.5892156697698692, 196.04167083150955, 2.8442479398494975], "isController": true}, {"data": ["5.9 Patient return to menacwy vaccination page", 27, 0, 0.0, 280.1111111111111, 178, 501, 242.0, 484.0, 494.2, 501.0, 0.1143297524125695, 3.3199006350065, 0.07971820627204552], "isController": false}, {"data": ["4.0 Vaccination", 93, 0, 0.0, 1498.215053763441, 601, 2654, 1504.0, 1682.6, 1895.3999999999999, 2654.0, 0.20791415157612342, 11.579948440643863, 1.2461618670355465], "isController": true}, {"data": ["2.5 Patient return to consent page", 42, 0, 0.0, 265.2857142857142, 176, 535, 234.5, 496.50000000000006, 526.85, 535.0, 0.18056905046475036, 4.01950031545843, 0.12519924397458274], "isController": false}, {"data": ["Debug Sampler", 111, 0, 0.0, 0.4414414414414415, 0, 3, 0.0, 1.0, 1.0, 2.759999999999991, 0.23834012209026437, 0.7977403081727042, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 50, 0, 0.0, 162.04000000000005, 133, 389, 155.0, 193.09999999999997, 261.1999999999995, 389.0, 0.12307086420360844, 1.3388763937775372, 0.07570540757993453], "isController": false}, {"data": ["4.2 Vaccination batch", 93, 0, 0.0, 346.33333333333337, 273, 952, 301.0, 495.0, 525.0999999999999, 952.0, 0.23095433809231716, 3.8121459049374558, 0.3702855359258165], "isController": false}, {"data": ["2.2 Session register", 42, 0, 0.0, 638.0714285714287, 195, 1280, 647.0, 1003.7, 1046.3500000000001, 1280.0, 0.18329725577822778, 19.107260023795913, 0.11574560250244396], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 0.13671875, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 58, 100.0, 4.865771812080537], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1192, 58, "404/Not Found", 58, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 100, 58, "404/Not Found", 58, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
