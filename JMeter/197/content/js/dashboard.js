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

    var data = {"OkPercent": 99.91359447004608, "KoPercent": 0.08640552995391705};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6846577726218097, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2819926873857404, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8596892138939671, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.1809872029250457, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.29381443298969073, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.14056939501779359, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9085923217550275, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9117915904936015, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.11070110701107011, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.13358778625954199, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.886168384879725, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.31512605042016806, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.7422680412371134, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.8679159049360147, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Add vaccination row to STS"], "isController": false}, {"data": [0.8874570446735395, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8629725085910653, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8976234003656307, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.11964285714285715, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}, {"data": [0.7084095063985375, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13888, 12, 0.08640552995391705, 642.8339573732724, 0, 15067, 192.0, 1521.1000000000004, 2543.0999999999985, 6692.9800000000105, 4.9653146600128775, 1544.141203325488, 22.428600292773194], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1094, 0, 0.0, 2188.3903107861024, 800, 15067, 1347.5, 4697.0, 6620.0, 10985.449999999999, 0.4236636683619667, 137.2918412468046, 2.559681053675553], "isController": false}, {"data": ["4.1 Vaccination questions", 1094, 0, 0.0, 508.70109689213876, 90, 11054, 164.0, 1174.5, 2067.25, 5721.299999999983, 0.425786469253274, 136.92055897281253, 2.435103199703584], "isController": false}, {"data": ["2.0 Register attendance", 1094, 10, 0.9140767824497258, 2710.2952468007284, 484, 17213, 1957.5, 5501.5, 7388.75, 12077.599999999999, 0.4244590862567597, 639.029772134775, 8.089840706717588], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 492.0, 492, 492, 492.0, 492.0, 492.0, 492.0, 2.032520325203252, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1164, 0, 0.0, 2075.484536082471, 675, 13065, 1288.5, 4363.5, 6533.75, 10344.29999999997, 0.4294285464470875, 594.9942038012219, 8.275202399099971], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 281, 0, 0.0, 3009.868327402136, 1047, 19577, 2106.0, 5992.6, 8496.8, 12294.260000000022, 0.11012905086786394, 106.9825207731412, 1.870029893815607], "isController": true}, {"data": ["2.5 Select patient", 1094, 0, 0.0, 340.2842778793424, 64, 10360, 107.0, 758.0, 1371.5, 3869.949999999997, 0.42680041306789523, 143.56587244926772, 1.7775550517427228], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["2.3 Search by first/last name", 1094, 0, 0.0, 319.8647166361975, 68, 8616, 108.0, 703.5, 1272.0, 3537.049999999991, 0.42471746970879287, 142.19029642872394, 1.8384240316470808], "isController": false}, {"data": ["4.0 Vaccination for flu", 271, 0, 0.0, 3205.830258302582, 1046, 15294, 2324.0, 6337.8, 9378.599999999991, 14613.67999999999, 0.10961266685596087, 106.39499093875361, 1.8576871204004137], "isController": true}, {"data": ["4.0 Vaccination for hpv", 262, 0, 0.0, 3223.1450381679374, 1076, 14703, 2417.5, 6412.400000000001, 9047.099999999999, 13560.140000000005, 0.10695881391656642, 104.6028228636763, 1.815187805848116], "isController": true}, {"data": ["1.2 Sign-in page", 1164, 0, 0.0, 448.14862542955296, 14, 10942, 132.0, 982.0, 1889.0, 6319.949999999997, 0.4294499351397778, 141.34360523877731, 2.125952571100897], "isController": false}, {"data": ["2.4 Patient attending session", 476, 10, 2.100840336134454, 1723.0798319327725, 247, 10456, 1087.0, 3347.8, 5209.949999999999, 8273.66, 0.19290084369803887, 66.32428384232038, 0.9827683456908748], "isController": false}, {"data": ["1.4 Open Sessions list", 1164, 0, 0.0, 737.4871134020628, 365, 11086, 481.0, 1211.0, 1874.0, 4841.799999999981, 0.42910417499192666, 167.00206858614138, 1.7863190753118376], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 62.3779296875, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 1094, 0, 0.0, 499.6755027422301, 84, 13144, 157.0, 1144.0, 1848.0, 6030.3499999999785, 0.42559747037934975, 136.98841038019685, 2.216767971378376], "isController": false}, {"data": ["Add vaccination row to STS", 1094, 0, 0.0, 44.08957952468006, 0, 48, 44.0, 44.0, 48.0, 48.0, 16.949415136726316, 4.849783823301572, 13.690575615849408], "isController": false}, {"data": ["1.1 Homepage", 1164, 0, 0.0, 391.3634020618557, 27, 11435, 137.0, 868.5, 1704.5, 3772.0499999999943, 0.42955199645730313, 143.49796485211084, 2.1166943535962064], "isController": false}, {"data": ["1.3 Sign-in", 1164, 0, 0.0, 498.48453608247434, 77, 11867, 152.5, 1088.0, 2059.0, 6488.549999999928, 0.4293483974128439, 143.04590034121486, 2.245181155561334], "isController": false}, {"data": ["2.2 Session register", 1094, 0, 0.0, 428.34003656307124, 67, 13476, 124.0, 826.5, 1749.75, 6065.399999999964, 0.4246952113091599, 149.59172574343498, 1.774768751710524], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 280, 0, 0.0, 3350.8821428571423, 1024, 18527, 2285.5, 7289.0, 8912.65, 13910.869999999995, 0.1108301215687687, 105.36887803662164, 1.8816915232076294], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 724.0, 724, 724, 724.0, 724.0, 724.0, 724.0, 1.3812154696132597, 536.9623510877072, 4.553694751381216], "isController": false}, {"data": ["2.1 Open session", 1094, 0, 0.0, 872.0923217550272, 203, 14699, 460.5, 1984.0, 3108.5, 5146.499999999987, 0.4251238066222942, 141.36158827470945, 1.7728233789823298], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, 83.33333333333333, 0.07200460829493087], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 16.666666666666668, 0.014400921658986175], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13888, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 476, 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
