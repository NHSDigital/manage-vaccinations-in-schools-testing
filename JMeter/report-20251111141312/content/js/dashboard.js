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

    var data = {"OkPercent": 99.69752619639192, "KoPercent": 0.30247380360808035};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.35779421885753615, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.004016064257028112, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.30855263157894736, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7800252844500632, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.78375, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4477886977886978, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.15514018691588785, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3471023427866831, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4235836627140975, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4791921664626683, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4081381011097411, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6983830845771144, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4245049504950495, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9257, 28, 0.30247380360808035, 1437.0297072485737, 263, 21830, 952.0, 2719.4000000000015, 4060.300000000001, 9046.400000000001, 5.140381788710706, 2101.0844757421055, 24.526474838603008], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 747, 0, 0.0, 3494.8634538152605, 1425, 21830, 2355.0, 7356.000000000005, 9704.400000000003, 14565.16, 0.45125426939698654, 182.27767961388614, 2.6985515953680896], "isController": false}, {"data": ["4.1 Vaccination questions", 760, 0, 0.0, 1831.2605263157905, 481, 12773, 1425.5, 2764.3999999999996, 3855.2999999999975, 9430.269999999999, 0.44444236518191726, 175.4421725247411, 2.517632021860424], "isController": false}, {"data": ["2.0 Register attendance", 797, 28, 3.5131744040150563, 5084.572145545796, 1621, 24661, 4037.0, 9410.000000000002, 11566.69999999999, 16624.819999999974, 0.45201931262438333, 860.4096589184275, 9.043583676778685], "isController": true}, {"data": ["1.0 Login", 811, 0, 0.0, 5195.909987669548, 2231, 20782, 4248.0, 8176.400000000001, 10009.199999999999, 16954.999999999993, 0.45287224870336695, 754.5066128562112, 8.602865314795075], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 189, 0, 0.0, 6713.857142857143, 2722, 21650, 5319.0, 11490.0, 13447.5, 20466.499999999993, 0.11303131445849926, 134.51904122103272, 1.8892639659832557], "isController": true}, {"data": ["2.5 Select patient", 791, 0, 0.0, 728.9936788874834, 311, 9769, 438.0, 1353.0000000000005, 2209.999999999999, 5558.720000000007, 0.45270026263483, 184.1120724180561, 1.8655090018173828], "isController": false}, {"data": ["2.3 Search by first/last name", 800, 0, 0.0, 671.1099999999997, 310, 15689, 461.5, 1037.9999999999995, 1766.8999999999971, 4288.610000000004, 0.4520420150450884, 184.1307612357515, 1.936896294357329], "isController": false}, {"data": ["4.0 Vaccination for flu", 190, 0, 0.0, 6535.721052631578, 2061, 21240, 5227.5, 11325.100000000002, 13837.799999999996, 21115.33, 0.11178673444472882, 132.87618327545428, 1.8649975693739649], "isController": true}, {"data": ["4.0 Vaccination for hpv", 189, 0, 0.0, 6495.49735449736, 3212, 23505, 5178.0, 12228.0, 14340.0, 19393.799999999974, 0.11313612131065502, 134.24893695912402, 1.8901295477802573], "isController": true}, {"data": ["1.2 Sign-in page", 814, 0, 0.0, 1241.7149877149889, 263, 18340, 826.5, 2125.5, 3312.75, 6981.7000000000135, 0.45400039041802615, 182.46175286800386, 2.2064108731420284], "isController": false}, {"data": ["2.4 Patient attending session", 535, 28, 5.233644859813084, 2515.8747663551408, 541, 17825, 1706.0, 4837.000000000003, 6637.399999999996, 11071.479999999998, 0.3049863269213996, 124.2354960786098, 1.5298501403720948], "isController": false}, {"data": ["1.4 Open Sessions list", 811, 0, 0.0, 1443.4032059186193, 707, 9781, 1163.0, 2244.2000000000003, 3013.9999999999995, 4640.36, 0.45399608925193646, 208.8513174922076, 1.869375627498448], "isController": false}, {"data": ["4.2 Vaccination batch", 759, 0, 0.0, 1316.7088274044797, 455, 14785, 856.0, 2263.0, 3878.0, 8903.599999999995, 0.44661403015321394, 177.47555336155025, 2.30203014376235], "isController": false}, {"data": ["1.1 Homepage", 817, 0, 0.0, 1099.239902080783, 451, 10455, 830.0, 1964.6000000000004, 2811.2999999999997, 5462.92, 0.4539968392484435, 182.27203055955806, 2.1934127123352107], "isController": false}, {"data": ["1.3 Sign-in", 811, 0, 0.0, 1410.171393341554, 446, 14491, 1096.0, 2262.6000000000013, 3635.599999999999, 8154.4, 0.45417456992020305, 182.87390104787062, 2.3566726333080767], "isController": false}, {"data": ["2.2 Session register", 804, 0, 0.0, 733.7039800995027, 312, 11307, 517.0, 1071.5, 1937.0, 4427.600000000009, 0.45270780076352213, 188.63575772689586, 1.872895308153808], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 191, 0, 0.0, 6611.633507853403, 2891, 24982, 5047.0, 12105.000000000002, 14162.199999999975, 19255.9199999999, 0.11331222917783969, 135.21531958442444, 1.8938930807904328], "isController": true}, {"data": ["2.1 Open session", 808, 0, 0.0, 1272.628712871287, 448, 10666, 877.0, 2474.700000000001, 3872.5999999999976, 7142.679999999986, 0.4537034385442409, 182.5252159776467, 1.8730368499982313], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 28, 100.0, 0.30247380360808035], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9257, 28, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 28, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 535, 28, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
