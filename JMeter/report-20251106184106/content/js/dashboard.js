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

    var data = {"OkPercent": 99.71795675336885, "KoPercent": 0.2820432466311501};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.46979002406838744, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07969151670951156, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4503105590062112, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.01746987951807229, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9082624544349939, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8699040767386091, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.002512562814070352, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.675531914893617, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.2861635220125786, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.36995249406175773, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5529265255292652, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.6751179245283019, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5941943127962085, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8179640718562874, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6294749403341289, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9573, 27, 0.2820432466311501, 971.5940666457742, 247, 18768, 673.0, 1718.0, 2275.5999999999985, 5392.8200000000015, 5.31609761894581, 1771.4465317571999, 25.31204205457066], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 778, 0, 0.0, 2333.2724935732663, 1238, 18768, 1761.0, 3717.6000000000013, 5394.849999999997, 9820.160000000014, 0.46683716023795496, 154.01609483739904, 2.7853332359630825], "isController": false}, {"data": ["4.1 Vaccination questions", 805, 0, 0.0, 1248.55155279503, 365, 16241, 1073.0, 1568.9999999999995, 2145.1999999999975, 4531.099999999996, 0.46892511877494625, 149.93514438852455, 2.6509526115488393], "isController": false}, {"data": ["2.0 Register attendance", 830, 27, 3.253012048192771, 3197.614457831322, 1213, 20910, 2884.0, 4879.9, 6262.299999999999, 11727.939999999939, 0.46858662981204596, 710.3366216700003, 9.12406952209527], "isController": true}, {"data": ["1.0 Login", 843, 0, 0.0, 3770.0806642941902, 1697, 18629, 3241.0, 5188.800000000001, 7127.4, 14279.399999999994, 0.471213494928446, 644.7908150347988, 8.93314247608857], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 200, 0, 0.0, 4255.380000000001, 1557, 15339, 3616.5, 5889.200000000001, 8877.05, 15060.480000000021, 0.11740968406815162, 111.12719621234892, 1.9482898765848107], "isController": true}, {"data": ["2.5 Select patient", 823, 0, 0.0, 454.47630619684037, 247, 9888, 341.0, 585.4000000000001, 956.1999999999996, 2382.8, 0.46768937015368967, 154.99776641743125, 1.9227034811034742], "isController": false}, {"data": ["2.3 Search by first/last name", 834, 0, 0.0, 462.53597122302176, 256, 9513, 365.5, 622.5, 909.0, 1887.1499999999965, 0.47114411756232066, 154.37753954058647, 2.0140790936718114], "isController": false}, {"data": ["4.0 Vaccination for flu", 199, 0, 0.0, 4169.386934673366, 1467, 11846, 3478.0, 6399.0, 9293.0, 10904.0, 0.11694916648742297, 112.01435942655093, 1.9368483270318888], "isController": true}, {"data": ["4.0 Vaccination for hpv", 204, 0, 0.0, 4274.421568627452, 1757, 21264, 3518.0, 6384.0, 9050.5, 13749.249999999984, 0.11903268439125576, 115.97652352445421, 1.974666396679338], "isController": true}, {"data": ["1.2 Sign-in page", 846, 0, 0.0, 824.0981087470445, 289, 16017, 562.0, 1345.1000000000004, 1836.3, 4327.449999999995, 0.47112677821122184, 154.83279052034868, 2.2868436080807153], "isController": false}, {"data": ["2.4 Patient attending session", 477, 27, 5.660377358490566, 1754.566037735849, 266, 16932, 1387.0, 2694.2, 3542.5999999999976, 7254.6799999999985, 0.30155976573168386, 98.38935964028724, 1.5080933206171416], "isController": false}, {"data": ["1.4 Open Sessions list", 842, 0, 0.0, 1267.6579572446556, 652, 14821, 1065.5, 1729.7, 2151.7999999999993, 4415.959999999992, 0.47157817388353024, 180.99069654357564, 1.9372439784171775], "isController": false}, {"data": ["4.2 Vaccination batch", 803, 0, 0.0, 788.1668742216688, 370, 7487, 671.0, 1085.6000000000001, 1566.7999999999997, 4876.120000000025, 0.46897220332251915, 150.1642291296784, 2.411900146845826], "isController": false}, {"data": ["1.1 Homepage", 848, 0, 0.0, 739.5648584905653, 351, 15782, 563.0, 902.0, 1375.9499999999987, 5615.199999999998, 0.4714324709121162, 156.81970964113455, 2.275126724404636], "isController": false}, {"data": ["1.3 Sign-in", 844, 0, 0.0, 939.2985781990519, 349, 10164, 745.5, 1313.0, 1736.75, 5743.849999999983, 0.47111964038611714, 152.24781451719028, 2.4384421825887244], "isController": false}, {"data": ["2.2 Session register", 835, 0, 0.0, 511.26586826347324, 253, 6321, 431.0, 674.4, 928.3999999999988, 2296.239999999996, 0.470999675658906, 161.9936626790927, 1.944049729069423], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 200, 0, 0.0, 4488.654999999997, 1756, 26123, 3574.0, 6787.3, 11047.299999999987, 18243.34000000002, 0.11819611453912675, 113.31938556082282, 1.9576110273355107], "isController": true}, {"data": ["2.1 Open session", 838, 0, 0.0, 763.3699284009537, 283, 15728, 606.0, 1155.7000000000003, 1412.5999999999995, 4514.170000000004, 0.47132536354765137, 154.05081210734605, 1.9412588180166652], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 27, 100.0, 0.2820432466311501], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9573, 27, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 27, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 477, 27, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
