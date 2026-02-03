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

    var data = {"OkPercent": 99.958482536717, "KoPercent": 0.04151746328299341};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4621970439153214, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1907703488372093, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.44778825235678027, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7857658959537572, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7606344628695025, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6069204152249135, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4316109422492401, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.29528105482303957, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.49274836838288616, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4948132780082988, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5488565488565489, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6856524873828407, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.09726224783861671, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19269, 8, 0.04151746328299341, 911.371944574185, 0, 13754, 796.0, 1728.0, 2114.0, 3278.2999999999993, 5.352422687227851, 1863.9561255057044, 19.262488691135573], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1376, 0, 0.0, 1697.8161337209276, 1110, 6644, 1579.5, 2229.0999999999995, 2464.899999999999, 3627.9800000000005, 0.39769717152337963, 160.1560507314261, 2.0628477524509967], "isController": false}, {"data": ["4.1 Vaccination questions", 1379, 0, 0.0, 1299.9854967367658, 593, 4127, 1239.0, 1506.0, 1615.0, 2079.2000000000007, 0.3948801314014465, 155.59382207135104, 1.9625947674731594], "isController": false}, {"data": ["Get Next Patient from STS", 1441, 0, 0.0, 0.594725884802221, 0, 7, 1.0, 1.0, 1.0, 1.0, 0.40218188557157836, 0.16769798238870362, 0.2567472395697854], "isController": false}, {"data": ["2.0 Register attendance", 1386, 8, 0.5772005772005772, 4722.937229437231, 2260, 17196, 4499.5, 6295.6, 7047.299999999999, 9557.30999999999, 0.3898133283533228, 749.5210571487504, 7.0693790666199705], "isController": true}, {"data": ["1.0 Login", 1443, 0, 0.0, 3898.513513513515, 2442, 9539, 3805.0, 4680.4000000000015, 4979.6, 5569.719999999999, 0.40164756219692027, 667.248899046334, 6.673179982729572], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 334, 0, 0.0, 3922.1586826347284, 2974, 7033, 3811.5, 4633.0, 4897.75, 6226.349999999992, 0.10701317575696603, 127.82622342853234, 1.567202226827242], "isController": true}, {"data": ["2.5 Select patient", 1384, 0, 0.0, 513.1763005780348, 339, 4171, 459.5, 711.0, 790.75, 1094.7500000000005, 0.39078846089771785, 158.6849775601056, 1.3890131145141489], "isController": false}, {"data": ["2.3 Search by first/last name", 1387, 0, 0.0, 531.1304974765683, 328, 4543, 480.0, 730.2, 803.0, 1155.0399999999981, 0.3888363867876367, 158.05200207680193, 1.4378260591621432], "isController": false}, {"data": ["4.0 Vaccination for flu", 377, 0, 0.0, 3835.9602122015913, 2496, 6189, 3755.0, 4535.6, 4773.2, 5857.459999999993, 0.10805883904105663, 128.560679093463, 1.5747096903985278], "isController": true}, {"data": ["4.0 Vaccination for hpv", 333, 0, 0.0, 3915.801801801802, 3008, 9053, 3765.0, 4647.8, 4980.300000000001, 7044.580000000032, 0.10687419302763035, 127.26608661958772, 1.5642868781358188], "isController": true}, {"data": ["1.2 Sign-in page", 1445, 0, 0.0, 767.2968858131485, 174, 3282, 669.0, 1252.0, 1370.1000000000001, 1687.5599999999995, 0.4019928831958907, 161.29314916321496, 1.715964195404985], "isController": false}, {"data": ["2.4 Patient attending session", 987, 8, 0.8105369807497467, 1184.793313069909, 441, 5859, 1101.0, 1594.4, 1864.7999999999993, 2421.7200000000003, 0.2776941537924806, 113.27031052833986, 1.2146544750222972], "isController": false}, {"data": ["Debug Sampler", 1386, 0, 0.0, 0.521645021645021, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.3900541263420775, 2.4361909679041176, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1441, 0, 0.0, 1453.2803608605136, 856, 3353, 1400.0, 1927.0, 2078.499999999999, 2453.7999999999993, 0.4020657417945525, 184.24309239641994, 1.4285998115473784], "isController": false}, {"data": ["4.2 Vaccination batch", 1379, 0, 0.0, 905.9158810732418, 553, 6147, 859.0, 1103.0, 1214.0, 1644.400000000005, 0.39492389624641877, 156.6572669460369, 1.768020924290168], "isController": false}, {"data": ["1.1 Homepage", 1446, 0, 0.0, 809.2088520055323, 548, 4883, 770.0, 1025.6, 1144.2999999999997, 1548.6199999999985, 0.4018983163906974, 161.08246745519986, 1.7076050670699083], "isController": false}, {"data": ["1.3 Sign-in", 1443, 0, 0.0, 871.0152460152473, 428, 2951, 816.0, 1288.0, 1379.8, 1885.0, 0.402090984579546, 161.4950405752611, 1.8290928492660379], "isController": false}, {"data": ["2.2 Session register", 1387, 0, 0.0, 568.8240807498198, 328, 4618, 542.0, 763.6000000000001, 854.0, 1129.3599999999997, 0.3888856645304591, 160.0969575094046, 1.389065166228995], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 335, 0, 0.0, 3934.3671641791066, 3079, 10202, 3820.0, 4602.2, 4850.0, 7123.799999999993, 0.10808086771837418, 129.2080893901771, 1.5825964123685163], "isController": true}, {"data": ["2.1 Open session", 1388, 0, 0.0, 2266.8134005763695, 498, 13754, 2071.5, 3415.500000000001, 4115.849999999999, 6859.649999999999, 0.38808446485025616, 156.0083354301859, 1.3827933714446443], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 100.0, 0.04151746328299341], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19269, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 987, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
