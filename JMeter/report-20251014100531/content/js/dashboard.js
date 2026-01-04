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

    var data = {"OkPercent": 99.91499008217626, "KoPercent": 0.0850099178237461};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4500755257755916, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16722185209860094, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.2567037279267495, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7522551546391752, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7373478539397822, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4164007657945118, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.38190954773869346, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3623003194888179, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4697964543663821, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4751592356687898, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.39552715654952075, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.674775928297055, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.513764404609475, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21174, 18, 0.0850099178237461, 893.2621139132879, 0, 10704, 794.0, 1655.0, 1979.0, 3127.870000000021, 5.880283166710499, 1581.8097586007193, 21.1124098350159], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1501, 0, 0.0, 1917.133244503664, 1034, 10704, 1668.0, 2796.0, 3487.899999999997, 5523.660000000002, 0.43427340071080806, 133.11207135437823, 2.252684205084384], "isController": false}, {"data": ["4.1 Vaccination questions", 1529, 0, 0.0, 1573.4440810987585, 573, 4360, 1495.0, 1877.0, 2240.0, 3239.000000000002, 0.4359651581435811, 129.71073376951114, 2.167126048943148], "isController": false}, {"data": ["Get Next Patient from STS", 1565, 0, 0.0, 0.5782747603833867, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.4364329180295319, 0.18359126303825912, 0.27862658979056515], "isController": false}, {"data": ["2.0 Register attendance", 1557, 18, 1.1560693641618498, 3511.0789980732184, 1664, 10341, 3359.0, 4920.8, 5565.2, 7249.680000000004, 0.4360019433869538, 641.0750886110244, 7.759481657447947], "isController": true}, {"data": ["1.0 Login", 1565, 0, 0.0, 4209.021086261986, 2292, 11057, 4020.0, 5163.200000000001, 5797.099999999998, 7705.099999999987, 0.43611694845209137, 563.8133530079147, 7.250284251064585], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 378, 0, 0.0, 4460.587301587294, 2262, 9585, 4197.0, 5818.800000000001, 6699.400000000001, 8517.539999999994, 0.10882019334296786, 99.55959972503469, 1.5862852999896362], "isController": true}, {"data": ["2.5 Select patient", 1552, 0, 0.0, 586.5483247422677, 350, 4778, 490.0, 865.0, 1164.499999999999, 2039.3800000000015, 0.43802830814388327, 137.3250580124677, 1.5569448817612859], "isController": false}, {"data": ["2.3 Search by first/last name", 1561, 0, 0.0, 577.6079436258811, 342, 3494, 503.0, 816.8, 1052.8999999999999, 1864.9399999999985, 0.43760424989136987, 136.2634585843215, 1.6180631662356502], "isController": false}, {"data": ["4.0 Vaccination for flu", 385, 0, 0.0, 4456.981818181823, 2196, 12361, 4157.0, 5640.200000000001, 6388.4, 8651.859999999995, 0.1104042688885932, 98.45958275807213, 1.6060152556116911], "isController": true}, {"data": ["4.0 Vaccination for hpv", 382, 0, 0.0, 4450.528795811517, 2323, 10794, 4284.0, 5671.0, 6286.9, 8510.070000000023, 0.10960759333861286, 98.30629413355484, 1.5954841608778363], "isController": true}, {"data": ["1.2 Sign-in page", 1567, 0, 0.0, 987.1742182514358, 246, 6623, 784.0, 1619.4, 1836.7999999999993, 2566.119999999999, 0.43594950330411886, 133.22502691125743, 1.8622408763412681], "isController": false}, {"data": ["2.4 Patient attending session", 995, 18, 1.8090452261306533, 1325.1517587939688, 581, 6587, 1124.0, 1974.7999999999997, 2601.3999999999996, 4494.119999999997, 0.27972004381062476, 90.92528877931859, 1.221513832138596], "isController": false}, {"data": ["Debug Sampler", 1557, 0, 0.0, 0.5131663455362868, 0, 8, 1.0, 1.0, 1.0, 1.0, 0.438286600590575, 2.7136128722585977, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1565, 0, 0.0, 1209.0568690095856, 487, 6138, 1062.0, 1832.4, 2028.6999999999998, 2774.219999999993, 0.4363167174262388, 159.99151903935257, 1.5503855787810956], "isController": false}, {"data": ["4.2 Vaccination batch", 1523, 0, 0.0, 1023.423506237688, 550, 7211, 969.0, 1329.0000000000007, 1577.8, 2561.84, 0.43573595602700366, 132.21214935486475, 1.9508392436698123], "isController": false}, {"data": ["1.1 Homepage", 1570, 0, 0.0, 916.3140127388532, 542, 4897, 838.5, 1226.800000000001, 1517.549999999993, 2563.0899999999992, 0.43631145078559685, 135.38887558561612, 1.8555823818200412], "isController": false}, {"data": ["1.3 Sign-in", 1565, 0, 0.0, 1096.0063897763555, 486, 6721, 941.0, 1637.4, 1887.7999999999993, 2995.2799999999966, 0.43649986793438506, 135.30395558917164, 1.984720959702137], "isController": false}, {"data": ["2.2 Session register", 1562, 0, 0.0, 632.6600512163908, 332, 4342, 557.5, 885.4000000000001, 1173.9499999999994, 1867.659999999998, 0.4367800085622304, 141.773131083759, 1.559055542576124], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 378, 0, 0.0, 4577.7089947089935, 2308, 13053, 4196.0, 5953.4000000000015, 7037.000000000002, 9083.66, 0.10975673494038873, 99.71741536817505, 1.5982071206496553], "isController": true}, {"data": ["2.1 Open session", 1562, 0, 0.0, 869.7131882202308, 370, 4713, 776.0, 1366.2000000000003, 1615.6999999999998, 2708.729999999997, 0.43676022339083076, 134.31357709838542, 1.5551462078964682], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.0850099178237461], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21174, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 995, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
