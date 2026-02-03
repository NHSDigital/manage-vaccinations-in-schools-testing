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

    var data = {"OkPercent": 99.92380226688256, "KoPercent": 0.07619773311743976};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5464657897818196, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2980705256154358, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4746877054569362, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.006501950585175552, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.00390625, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.895114006514658, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9013583441138422, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.006313131313131313, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6673040152963671, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.42937219730941706, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.4572976418100701, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.515820698747528, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5311704834605598, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5933715742511153, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8311814073595868, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0012987012987012987, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.618786313750807, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20998, 16, 0.07619773311743976, 699.148871321074, 0, 13151, 596.0, 1290.0, 1567.0, 2703.0, 5.83183658415128, 1411.8846223185924, 20.93079409441143], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1503, 0, 0.0, 1625.3632734530959, 906, 13151, 1403.0, 2349.2000000000025, 2909.9999999999995, 4269.000000000002, 0.4336414601628334, 119.57380917155656, 2.249400118494044], "isController": false}, {"data": ["4.1 Vaccination questions", 1521, 0, 0.0, 1123.741617356999, 466, 9705, 1051.0, 1331.8, 1523.8999999999985, 3047.0199999999995, 0.4327422887372631, 116.8034358841514, 2.151332406500922], "isController": false}, {"data": ["Get Next Patient from STS", 1569, 0, 0.0, 0.61504142766093, 0, 6, 1.0, 1.0, 1.0, 1.0, 0.4377539789158265, 0.18371784590306636, 0.27948225050952724], "isController": false}, {"data": ["2.0 Register attendance", 1538, 16, 1.0403120936280885, 2794.698309492847, 1244, 13027, 2629.5, 3886.3, 4441.65, 7269.109999999995, 0.4306524889221787, 561.4477095226387, 7.5568946968212085], "isController": true}, {"data": ["1.0 Login", 1569, 0, 0.0, 3242.3231357552577, 1801, 15286, 3046.0, 3906.0, 4354.5, 8641.399999999996, 0.43730900828685243, 512.6903178898893, 7.270205648114805], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 384, 0, 0.0, 3453.5078125000023, 1341, 13482, 3174.5, 4302.5, 5039.25, 8441.749999999944, 0.11051240631267586, 87.7949406641551, 1.6125824544143519], "isController": true}, {"data": ["2.5 Select patient", 1535, 0, 0.0, 479.2527687296427, 279, 7510, 397.0, 627.4000000000001, 840.1999999999998, 1951.5199999999945, 0.43107382314740056, 121.59575310668023, 1.5322414061677256], "isController": false}, {"data": ["2.3 Search by first/last name", 1546, 0, 0.0, 460.43984476067266, 273, 7480, 390.0, 611.6999999999996, 765.6499999999999, 1285.7099999999998, 0.43308172946958695, 123.23222563319995, 1.601423638443287], "isController": false}, {"data": ["4.0 Vaccination for flu", 351, 0, 0.0, 3486.883190883191, 2524, 11729, 3231.0, 4398.6, 4848.999999999998, 9280.920000000004, 0.11128961839075212, 99.24270359916491, 1.6263399341393745], "isController": true}, {"data": ["4.0 Vaccination for hpv", 396, 0, 0.0, 3474.479797979797, 1308, 12889, 3151.0, 4403.6, 5258.049999999996, 11191.789999999992, 0.11345901880296724, 89.59852033305236, 1.6518356589447682], "isController": true}, {"data": ["1.2 Sign-in page", 1569, 0, 0.0, 702.6469088591456, 181, 9238, 546.0, 1094.0, 1237.5, 2121.4999999999964, 0.4375172887647568, 122.03987171483843, 1.8689710770293944], "isController": false}, {"data": ["Debug Sampler", 1538, 0, 0.0, 0.566970091027308, 0, 9, 1.0, 1.0, 1.0, 1.0, 0.43106130207419524, 2.7123547751880777, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 892, 16, 1.7937219730941705, 1117.7298206278033, 457, 7100, 970.0, 1590.1000000000006, 1936.499999999999, 3123.839999999993, 0.26299937817747915, 70.31088383777052, 1.148524982950741], "isController": false}, {"data": ["1.4 Open Sessions list", 1569, 0, 0.0, 1043.835564053539, 496, 9277, 936.0, 1463.0, 1636.0, 2236.9999999999995, 0.43766068827931287, 146.57698307284875, 1.5551637593484071], "isController": false}, {"data": ["4.2 Vaccination batch", 1517, 0, 0.0, 742.8622280817426, 439, 9040, 690.0, 955.0, 1135.3999999999996, 1981.4199999999948, 0.4322629435254306, 117.78172853548773, 1.9352861060837945], "isController": false}, {"data": ["1.1 Homepage", 1572, 0, 0.0, 705.9083969465654, 434, 9390, 618.5, 903.7, 1156.3999999999996, 1951.579999999999, 0.43677100640708616, 121.94468814294873, 1.857577543697939], "isController": false}, {"data": ["1.3 Sign-in", 1569, 0, 0.0, 789.8648820905045, 367, 8695, 681.0, 1152.0, 1300.0, 1935.7999999999993, 0.43758684104692863, 122.01627679373999, 1.989648037786279], "isController": false}, {"data": ["2.2 Session register", 1549, 0, 0.0, 504.63589412524186, 270, 7364, 433.0, 716.0, 920.5, 1654.0, 0.4334821743398702, 127.17268340866218, 1.5475094119362354], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 385, 0, 0.0, 3499.9532467532463, 1465, 14841, 3191.0, 4526.400000000001, 5278.099999999999, 9612.159999999996, 0.11088815072263072, 88.55585377197565, 1.6193520601038258], "isController": true}, {"data": ["2.1 Open session", 1549, 0, 0.0, 700.0845706907674, 293, 9193, 602.0, 1053.0, 1192.0, 2055.5, 0.4334721059720367, 120.22310692679821, 1.5436636549415121], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, 100.0, 0.07619773311743976], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20998, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 892, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
