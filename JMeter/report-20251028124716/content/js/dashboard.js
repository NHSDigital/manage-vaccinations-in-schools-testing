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

    var data = {"OkPercent": 99.92596020360943, "KoPercent": 0.07403979639055992};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3197268588770865, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [6.435006435006435E-4, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4981108312342569, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4968789013732834, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3216482164821648, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.15476190476190477, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.23800259403372243, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.36993865030674844, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.2725587144622991, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4925373134328358, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4763975155279503, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10805, 8, 0.07403979639055992, 1269.8417399352118, 0, 5870, 1183.0, 2339.3999999999996, 2652.0, 3375.0, 5.995709502464317, 2086.0046604086738, 21.455437759624488], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 746, 0, 0.0, 2530.962466487938, 1908, 5721, 2428.0, 3120.5000000000005, 3435.2999999999993, 4233.989999999998, 0.44668010698766963, 179.87075307736248, 2.3168928486799287], "isController": false}, {"data": ["4.1 Vaccination questions", 777, 0, 0.0, 2238.9523809523807, 1421, 3656, 2153.0, 2512.4, 2745.5999999999995, 3211.580000000001, 0.4516370535361379, 177.96327407782778, 2.2440313077261327], "isController": false}, {"data": ["Get Next Patient from STS", 806, 0, 0.0, 0.5918114143920592, 0, 10, 1.0, 1.0, 1.0, 1.0, 0.4522434304066936, 0.19041814229087667, 0.2887228308516989], "isController": false}, {"data": ["2.0 Register attendance", 796, 8, 1.0050251256281406, 4401.99623115578, 2623, 7307, 4536.5, 5572.900000000001, 5860.3, 6627.349999999996, 0.44995342190707893, 843.3354420778239, 7.892143186512477], "isController": true}, {"data": ["1.0 Login", 809, 0, 0.0, 6671.441285537701, 3811, 9264, 6604.0, 7413.0, 7916.5, 8596.9, 0.4520037903506968, 749.8195266222341, 7.483927854447237], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 192, 0, 0.0, 6169.348958333334, 3206, 8494, 6100.5, 6939.3, 7145.95, 7810.449999999995, 0.1129202530119419, 133.68243014437766, 1.637922605517213], "isController": true}, {"data": ["2.5 Select patient", 794, 0, 0.0, 763.9118387909311, 618, 1933, 686.0, 981.5, 1128.5, 1419.5499999999986, 0.451931094737621, 183.25721403547718, 1.6063654240340257], "isController": false}, {"data": ["2.3 Search by first/last name", 801, 0, 0.0, 782.2759051186018, 627, 2165, 723.0, 971.8000000000001, 1090.6, 1470.5000000000005, 0.45264466546112114, 183.90473239891784, 1.6737351926282777], "isController": false}, {"data": ["4.0 Vaccination for flu", 193, 0, 0.0, 6122.740932642486, 3375, 8089, 6107.0, 6937.2, 7195.799999999998, 7954.58, 0.11285949110310504, 132.74810227112914, 1.6245126447218308], "isController": true}, {"data": ["4.0 Vaccination for hpv", 192, 0, 0.0, 6304.927083333337, 3377, 9488, 6225.0, 7194.200000000002, 7581.299999999999, 8482.669999999993, 0.11242896334054557, 132.71198081662516, 1.62995005841036], "isController": true}, {"data": ["1.2 Sign-in page", 813, 0, 0.0, 1314.6051660516596, 311, 2971, 1161.0, 2025.0, 2123.0999999999995, 2478.6000000000004, 0.45285087169615207, 181.45425602620995, 1.919464930306641], "isController": false}, {"data": ["Debug Sampler", 796, 0, 0.0, 0.5050251256281405, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.4509702943147716, 2.7811435602461754, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 462, 8, 1.7316017316017316, 1679.6645021645013, 767, 3604, 1583.5, 2070.7999999999997, 2343.3999999999996, 2943.9400000000005, 0.29000263011043326, 118.08451970609458, 1.2665780030965], "isController": false}, {"data": ["1.4 Open Sessions list", 806, 0, 0.0, 2510.52853598015, 1742, 5870, 2353.5, 3249.9, 3551.849999999999, 4418.659999999997, 0.4517511803821165, 206.99424373678656, 1.604244772633519], "isController": false}, {"data": ["4.2 Vaccination batch", 771, 0, 0.0, 1505.9481193255517, 1070, 2821, 1512.0, 1746.8000000000002, 1887.6, 2440.279999999999, 0.45118774735592865, 178.97376860417958, 2.0189717891715526], "isController": false}, {"data": ["1.1 Homepage", 815, 0, 0.0, 1394.98282208589, 1050, 3038, 1359.0, 1837.1999999999998, 1967.1999999999996, 2311.040000000002, 0.4527196787523379, 181.20885532363624, 1.9058014290943774], "isController": false}, {"data": ["1.3 Sign-in", 809, 0, 0.0, 1458.6576019777513, 786, 2835, 1338.0, 2032.0, 2115.0, 2485.199999999999, 0.4525927297607412, 181.68069758616744, 2.069226123600613], "isController": false}, {"data": ["2.2 Session register", 804, 0, 0.0, 855.4813432835821, 615, 1933, 808.0, 1111.5, 1282.5, 1606.2500000000025, 0.45306673774479833, 191.24761258588686, 1.6157187884071267], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 193, 0, 0.0, 6196.279792746109, 3362, 8082, 6175.0, 6950.8, 7236.199999999999, 7663.700000000001, 0.11394329402388086, 134.78423406989359, 1.6496778740424778], "isController": true}, {"data": ["2.1 Open session", 805, 0, 0.0, 1024.5031055900602, 634, 2819, 988.0, 1312.4, 1485.7999999999997, 1955.3399999999992, 0.45310758631558806, 180.47250097798067, 1.61188714384618], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.07403979639055992], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10805, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 462, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
