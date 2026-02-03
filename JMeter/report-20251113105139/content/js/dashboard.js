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

    var data = {"OkPercent": 99.75853018372703, "KoPercent": 0.24146981627296588};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3359675531025255, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.013054830287206266, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.005739795918367347, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.807361963190184, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7266099635479951, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.39590854392298436, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.23642732049036777, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.33995186522262333, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.49104859335038364, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4904076738609113, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.35980746089049337, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6336154776299879, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.46325301204819275, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9525, 23, 0.24146981627296588, 1072.9856167979024, 302, 5539, 882.0, 1887.0, 2123.699999999999, 2776.74, 5.2869847479509815, 2160.8918870724688, 25.495793369302405], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 766, 0, 0.0, 2123.861618798955, 1394, 5539, 1989.5, 2732.2000000000003, 3121.0999999999995, 4355.780000000007, 0.46360181083109403, 187.245884994901, 2.8009390338653257], "isController": false}, {"data": ["4.1 Vaccination questions", 784, 0, 0.0, 1643.3737244897957, 566, 2936, 1588.0, 1826.0, 1983.25, 2583.2499999999986, 0.4603959640186461, 181.7310650827905, 2.632336014584393], "isController": false}, {"data": ["2.0 Register attendance", 820, 23, 2.8048780487804876, 3647.969512195122, 1704, 7158, 3726.0, 4892.5, 5157.9, 6104.329999999995, 0.46334254179547496, 887.0140602389096, 9.432598651701456], "isController": true}, {"data": ["1.0 Login", 831, 0, 0.0, 4298.878459687121, 2474, 6881, 4261.0, 4944.800000000001, 5211.4, 5811.799999999999, 0.46417086850223627, 773.2681864885013, 8.91364739593021], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 195, 0, 0.0, 4696.287179487182, 2256, 8198, 4587.0, 5531.6, 5908.5999999999985, 7522.159999999994, 0.11584208881702059, 137.40237090048956, 1.9486770768481565], "isController": true}, {"data": ["2.5 Select patient", 815, 0, 0.0, 491.66257668711677, 354, 1621, 417.0, 675.5999999999999, 842.799999999998, 1239.9600000000005, 0.46675688724127207, 189.81597568332637, 1.9439454553413884], "isController": false}, {"data": ["2.3 Search by first/last name", 823, 0, 0.0, 516.6743620899157, 354, 1700, 511.0, 714.6, 823.0, 1268.5999999999995, 0.46489164296547775, 189.4248536975267, 2.01227187458517], "isController": false}, {"data": ["4.0 Vaccination for flu", 196, 0, 0.0, 4559.1530612244915, 2387, 6947, 4475.5, 5245.400000000001, 5596.649999999999, 6879.1, 0.11595094565095215, 137.36193446645558, 1.9470040444177903], "isController": true}, {"data": ["4.0 Vaccination for hpv", 195, 0, 0.0, 4673.046153846155, 2089, 8094, 4590.0, 5398.8, 5674.999999999998, 7255.919999999993, 0.11654287223793393, 138.54471439973847, 1.9703379526644689], "isController": true}, {"data": ["1.2 Sign-in page", 831, 0, 0.0, 973.6630565583629, 302, 3446, 746.0, 1739.0, 1818.4, 2229.399999999996, 0.4653506929861403, 187.01901391659666, 2.2869811353772924], "isController": false}, {"data": ["2.4 Patient attending session", 571, 23, 4.028021015761821, 1591.5464098073542, 490, 3618, 1493.0, 2141.4000000000015, 2425.6, 3168.999999999996, 0.3252499326430744, 132.66139693511036, 1.6517866424523502], "isController": false}, {"data": ["1.4 Open Sessions list", 831, 0, 0.0, 1355.802647412756, 665, 3356, 1150.0, 2084.8, 2191.0, 2642.6399999999926, 0.46471363909365737, 213.73968320255221, 1.9339781934103493], "isController": false}, {"data": ["4.2 Vaccination batch", 782, 0, 0.0, 925.8337595907931, 520, 2335, 944.5, 1098.1000000000001, 1209.6999999999998, 1725.3799999999994, 0.4617129550632848, 183.4673383427147, 2.404269103078303], "isController": false}, {"data": ["1.1 Homepage", 834, 0, 0.0, 839.0395683453249, 506, 2306, 735.0, 1341.5, 1359.0, 1841.1499999999996, 0.46417322900381414, 186.34930514286825, 2.268112269673515], "isController": false}, {"data": ["1.3 Sign-in", 831, 0, 0.0, 1130.0794223826729, 510, 3031, 976.0, 1754.6000000000001, 1856.0, 2562.359999999996, 0.46531134704555294, 187.34571753802422, 2.4388649141595753], "isController": false}, {"data": ["2.2 Session register", 827, 0, 0.0, 588.6759371221286, 357, 1822, 536.0, 820.4000000000001, 928.3999999999996, 1388.9200000000023, 0.46581052157260333, 193.97516877798665, 1.9476310796158611], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 196, 0, 0.0, 4669.928571428569, 2419, 7075, 4550.0, 5353.1, 5806.499999999999, 6822.8, 0.11691601791201116, 139.28329047997158, 1.970236224042109], "isController": true}, {"data": ["2.1 Open session", 830, 0, 0.0, 945.4530120481916, 466, 3016, 854.5, 1401.8, 1691.7999999999997, 2429.69, 0.46615673986825173, 187.48853036786505, 1.9449889765163713], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, 100.0, 0.24146981627296588], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9525, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 571, 23, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
