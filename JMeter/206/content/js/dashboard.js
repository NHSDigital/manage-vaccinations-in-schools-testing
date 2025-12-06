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

    var data = {"OkPercent": 99.8215504120086, "KoPercent": 0.17844958799139243};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7576010691613766, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.37168978562421184, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9658597144630664, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.24311926605504589, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4387135922330097, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.24476439790575916, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9779276517473943, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9850609756097561, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.25406032482598606, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.24271844660194175, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9694309927360775, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4056169429097606, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8271567436208992, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9757613424487259, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9761329305135952, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9672528805336568, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9795856185252895, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.2597911227154047, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8919659160073037, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19053, 34, 0.17844958799139243, 375.0450322783842, 3, 5279, 150.0, 1013.0, 1295.0, 2202.7599999999948, 5.079666218500031, 2075.773498292681, 24.58178027372624], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1586, 0, 0.0, 1347.4445145018906, 816, 5279, 1139.5, 2103.6, 2551.6499999999996, 3540.839999999992, 0.45679197244271375, 184.46431815616683, 2.7598567435319006], "isController": false}, {"data": ["4.1 Vaccination questions", 1611, 0, 0.0, 200.66604593420254, 84, 2240, 127.0, 387.0, 594.5999999999995, 1078.3199999999983, 0.45739705585070745, 180.5379945547995, 2.616193853428945], "isController": false}, {"data": ["2.0 Register attendance", 1635, 34, 2.079510703363914, 1603.4091743119245, 408, 5957, 1568.0, 2657.6000000000004, 3096.7999999999975, 4000.079999999994, 0.4585195455524445, 872.4345496760532, 9.266955416546077], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1648, 0, 0.0, 1070.6383495145628, 630, 4015, 935.0, 1617.9000000000012, 1907.1, 2582.16, 0.4589794113756153, 764.8665135893973, 8.865059533030921], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 382, 0, 0.0, 1721.3638743455504, 221, 4177, 1525.0, 2554.1, 3063.85, 3977.4200000000005, 0.10980390804181402, 130.68379957057186, 1.8542644854745527], "isController": true}, {"data": ["2.5 Select patient", 1631, 0, 0.0, 146.48743102391185, 66, 2054, 94.0, 245.5999999999999, 439.1999999999996, 972.7600000000004, 0.4574492283243811, 186.01096653056666, 1.9052618590066313], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1640, 0, 0.0, 129.4439024390241, 58, 1763, 85.0, 217.0, 336.89999999999964, 877.1899999999966, 0.45879195043927934, 186.77803648934636, 1.9860711664295776], "isController": false}, {"data": ["4.0 Vaccination for flu", 431, 0, 0.0, 1735.9373549883999, 202, 5950, 1499.0, 2667.8, 3026.7999999999997, 4027.36, 0.12325981309694141, 147.05708834502323, 2.0859614222523715], "isController": true}, {"data": ["4.0 Vaccination for hpv", 412, 0, 0.0, 1686.657766990291, 191, 5154, 1543.5, 2452.2999999999997, 2992.499999999997, 4241.71, 0.11831943893611296, 140.56675820074688, 1.99976112423498], "isController": true}, {"data": ["1.2 Sign-in page", 1652, 0, 0.0, 177.4164648910415, 13, 2028, 110.0, 355.0, 573.5999999999985, 1132.510000000001, 0.4594751025405469, 184.89512442106692, 2.2867543229459137], "isController": false}, {"data": ["2.4 Patient attending session", 1086, 34, 3.130755064456722, 1155.9585635359106, 123, 4280, 990.5, 1778.0000000000007, 2209.749999999998, 3095.8599999999974, 0.30614997796904164, 124.8706709162419, 1.5571152639514603], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 15.673828125, 29.4921875], "isController": false}, {"data": ["1.4 Open Sessions list", 1646, 0, 0.0, 533.6196840826243, 381, 2003, 460.0, 732.5999999999999, 993.8999999999992, 1457.0, 0.4588513996082758, 211.00330956111046, 1.9107049625573356], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1609, 0, 0.0, 180.5463020509634, 82, 1670, 116.0, 337.0, 476.5, 1031.6000000000013, 0.45768243722582436, 181.86429136833038, 2.3844815079690505], "isController": false}, {"data": ["1.1 Homepage", 1655, 0, 0.0, 169.66042296072493, 26, 2052, 114.0, 292.4000000000001, 467.7999999999993, 1146.1600000000008, 0.4597317999680549, 184.80012278901643, 2.2796701602290326], "isController": false}, {"data": ["1.3 Sign-in", 1649, 0, 0.0, 191.21588841722274, 75, 2026, 116.0, 373.0, 572.0, 1095.5, 0.4590315075440951, 184.88970657379954, 2.3963943713592735], "isController": false}, {"data": ["2.2 Session register", 1641, 0, 0.0, 147.10847044485078, 59, 1585, 87.0, 279.0, 436.4999999999993, 912.5799999999999, 0.45859342883963006, 191.3024241577712, 1.917046857084011], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 383, 0, 0.0, 1693.0182767624024, 255, 4942, 1509.0, 2501.600000000001, 2932.599999999999, 4028.9599999999964, 0.11007040770021534, 130.98989725462707, 1.853391374248439], "isController": true}, {"data": ["2.1 Open session", 1643, 0, 0.0, 413.4522215459531, 161, 2532, 313.0, 701.6000000000001, 972.3999999999996, 1805.9199999999996, 0.4585370073971536, 184.38941077218342, 1.9127846494759477], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, 100.0, 0.17844958799139243], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19053, 34, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1086, 34, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
