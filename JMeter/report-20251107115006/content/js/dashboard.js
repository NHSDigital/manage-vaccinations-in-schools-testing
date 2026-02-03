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

    var data = {"OkPercent": 99.68377523716858, "KoPercent": 0.31622476283142786};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.29817645351649413, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [3.620564808110065E-4, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.025252525252525252, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7257368799424874, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7080945558739254, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3370089593383873, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.08112582781456953, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.30427291523087524, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4404332129963899, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4383184011026878, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.31840110268780153, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.635647816750179, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3798283261802575, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16444, 52, 0.31622476283142786, 1429.1009486742928, 306, 22617, 1090.0, 2512.0, 3307.25, 6893.399999999994, 4.568993637751379, 1820.6715335310932, 21.83881420953479], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1381, 0, 0.0, 3185.711803041277, 1484, 22617, 2561.0, 4974.599999999999, 7080.199999999996, 12529.960000000034, 0.40115250737745894, 156.61783073786063, 2.393453124269262], "isController": false}, {"data": ["4.1 Vaccination questions", 1386, 0, 0.0, 1903.7950937950936, 615, 19373, 1642.0, 2374.0999999999995, 3073.749999999998, 6679.199999999995, 0.3957451401297565, 152.18844906514133, 2.2378696378460843], "isController": false}, {"data": ["2.0 Register attendance", 1394, 52, 3.7302725968436157, 4975.530129124815, 1900, 24063, 4407.0, 7522.0, 10149.0, 16658.949999999997, 0.3923809416579643, 728.5002998185167, 7.798598428699401], "isController": true}, {"data": ["1.0 Login", 1451, 0, 0.0, 5438.813921433491, 2553, 26830, 4811.0, 7205.199999999999, 9574.799999999996, 15471.80000000001, 0.404506948961036, 656.5109879801707, 7.708956551099458], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 337, 0, 0.0, 6294.970326409498, 3969, 26276, 5417.0, 9753.999999999998, 12607.399999999994, 16241.980000000001, 0.10419326892931986, 122.42519545996382, 1.747991784403257], "isController": true}, {"data": ["2.5 Select patient", 1391, 0, 0.0, 671.203450754853, 354, 10584, 493.0, 1146.7999999999997, 1583.7999999999997, 2796.799999999981, 0.39316875645329563, 156.97136456958057, 1.616329834845097], "isController": false}, {"data": ["2.3 Search by first/last name", 1396, 0, 0.0, 678.2249283667626, 353, 12673, 523.0, 1002.5999999999999, 1351.3999999999978, 3879.289999999999, 0.3919114639437242, 156.18603677365132, 1.6754155865238605], "isController": false}, {"data": ["4.0 Vaccination for flu", 369, 0, 0.0, 5983.208672086718, 2131, 27479, 5206.0, 8670.0, 10871.0, 17695.50000000002, 0.10568245087054845, 120.2940065220428, 1.76290380442861], "isController": true}, {"data": ["4.0 Vaccination for hpv", 341, 0, 0.0, 6357.076246334314, 3996, 26579, 5399.0, 9457.4, 12499.199999999997, 20126.119999999937, 0.10493034133132294, 121.76164028903924, 1.7595932723226992], "isController": true}, {"data": ["1.2 Sign-in page", 1451, 0, 0.0, 1336.1123363197796, 306, 12050, 980.0, 2153.5999999999995, 2952.3999999999965, 6348.760000000002, 0.4051892144271934, 158.55073671535777, 1.9872726434903183], "isController": false}, {"data": ["2.4 Patient attending session", 906, 52, 5.739514348785872, 2386.001103752761, 469, 18079, 1914.0, 3737.0000000000036, 5039.6, 10878.729999999998, 0.25500604161664825, 101.45511173296589, 1.2751121183951395], "isController": false}, {"data": ["1.4 Open Sessions list", 1451, 0, 0.0, 1583.424534803584, 789, 13995, 1353.0, 2378.6, 2616.399999999999, 3769.2400000000007, 0.4052091295208674, 181.54624317850258, 1.6653316235111495], "isController": false}, {"data": ["4.2 Vaccination batch", 1385, 0, 0.0, 1175.2967509025257, 528, 8986, 999.0, 1591.4000000000005, 2391.000000000003, 5628.56, 0.3969622215209701, 153.42017946660243, 2.042309108194275], "isController": false}, {"data": ["1.1 Homepage", 1451, 0, 0.0, 1106.6395589248784, 508, 12885, 880.0, 1612.3999999999999, 2351.1999999999975, 5006.600000000004, 0.40488767227258904, 158.6974492194367, 1.9777854710097915], "isController": false}, {"data": ["1.3 Sign-in", 1451, 0, 0.0, 1412.6374913852542, 508, 20549, 1228.0, 2112.2, 2694.799999999992, 5322.880000000003, 0.40531360267087974, 158.76332465631796, 2.0908197385559664], "isController": false}, {"data": ["2.2 Session register", 1397, 0, 0.0, 722.7015032211885, 356, 12462, 580.0, 1066.0, 1391.1, 3319.3999999999987, 0.3909118179050485, 158.23903899579736, 1.613851062300067], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 338, 0, 0.0, 6412.097633136101, 3921, 36897, 5323.0, 9571.600000000006, 12103.700000000004, 24969.980000000076, 0.1054834214702454, 123.38943767759366, 1.7694798846158046], "isController": true}, {"data": ["2.1 Open session", 1398, 0, 0.0, 1352.4506437768248, 512, 11886, 1085.5, 2065.1000000000004, 2838.4999999999986, 5956.299999999996, 0.3907978565939591, 154.47808505538538, 1.6099467873369195], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, 100.0, 0.31622476283142786], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16444, 52, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 906, 52, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
