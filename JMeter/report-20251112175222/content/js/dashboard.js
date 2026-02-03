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

    var data = {"OkPercent": 99.80653482373172, "KoPercent": 0.1934651762682717};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3052640633063822, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.014627659574468085, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7632600258732212, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7436224489795918, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.36260978670012545, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.027704485488126648, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.33544303797468356, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4472630173564753, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.45318352059925093, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3203026481715006, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6755725190839694, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.38910012674271227, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9304, 18, 0.1934651762682717, 1317.7998710232182, 326, 8427, 1081.0, 2404.5, 2944.5, 4208.400000000023, 5.161633925648949, 2109.23474628803, 24.675567769676512], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 732, 0, 0.0, 2956.228142076502, 1684, 8427, 2692.5, 4131.0, 5027.800000000001, 6553.249999999993, 0.44120385968993975, 178.1877095407547, 2.638468748926374], "isController": false}, {"data": ["4.1 Vaccination questions", 752, 0, 0.0, 1783.7460106382978, 807, 4168, 1646.0, 2294.1000000000004, 2539.7, 3050.2900000000054, 0.4398867291672395, 173.63552831705013, 2.491766999070213], "isController": false}, {"data": ["2.0 Register attendance", 780, 18, 2.3076923076923075, 5196.914102564105, 2021, 10138, 5122.5, 6624.4, 7150.499999999999, 8292.76, 0.4419932080377032, 894.770325981147, 9.510959837833825], "isController": true}, {"data": ["1.0 Login", 793, 0, 0.0, 4878.375788146282, 2563, 8035, 4737.0, 5800.0, 6210.799999999999, 7356.439999999999, 0.4432485366649824, 737.5337877445971, 8.410677446069565], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 182, 0, 0.0, 5780.472527472528, 2326, 10298, 5579.0, 7609.900000000006, 8619.199999999999, 9971.809999999996, 0.10831715023529223, 128.40389876088454, 1.8029614232486695], "isController": true}, {"data": ["2.5 Select patient", 773, 0, 0.0, 596.5058214747737, 350, 3292, 465.0, 1013.2, 1354.2999999999995, 1883.0, 0.4433694471991727, 180.3105973166541, 1.8270404691485413], "isController": false}, {"data": ["2.3 Search by first/last name", 784, 0, 0.0, 584.4579081632648, 349, 2361, 498.0, 946.0, 1184.75, 1739.249999999999, 0.4436532125811902, 180.6110346189916, 1.900897314617751], "isController": false}, {"data": ["4.0 Vaccination for flu", 192, 0, 0.0, 5724.942708333334, 2421, 10148, 5582.5, 7253.800000000002, 7976.799999999999, 9186.379999999994, 0.11420264545669757, 135.51040390003521, 1.9019008662300398], "isController": true}, {"data": ["4.0 Vaccination for hpv", 192, 0, 0.0, 5719.43229166667, 2317, 11888, 5585.0, 7159.000000000002, 7924.799999999999, 11516.929999999997, 0.11338049253194583, 134.3077208157062, 1.8908167078851998], "isController": true}, {"data": ["1.2 Sign-in page", 797, 0, 0.0, 1140.816813048934, 326, 3801, 904.0, 1901.8000000000004, 2254.999999999998, 3055.059999999998, 0.4438177908008879, 178.33442042937284, 2.155700396122692], "isController": false}, {"data": ["2.4 Patient attending session", 758, 18, 2.37467018469657, 2251.4102902374625, 542, 7088, 2046.5, 3343.3, 3790.999999999999, 5118.82, 0.4308433844509873, 175.71550546387425, 2.171389777203383], "isController": false}, {"data": ["1.4 Open Sessions list", 790, 0, 0.0, 1480.498734177215, 781, 4178, 1295.5, 2249.6, 2426.35, 3269.9000000000005, 0.44281344605831574, 203.64877951120403, 1.823277357603247], "isController": false}, {"data": ["4.2 Vaccination batch", 749, 0, 0.0, 1065.8357810413877, 514, 4990, 993.0, 1531.0, 1767.5, 2251.5, 0.4417815652633466, 175.5526799264543, 2.277093501424141], "isController": false}, {"data": ["1.1 Homepage", 801, 0, 0.0, 964.9063670411987, 505, 3900, 830.0, 1467.4000000000005, 1819.6999999999998, 2430.92, 0.44495031388161654, 178.60475523809563, 2.148370124711074], "isController": false}, {"data": ["1.3 Sign-in", 793, 0, 0.0, 1296.4640605296338, 507, 4872, 1193.0, 1940.6, 2284.2999999999993, 2778.339999999998, 0.443602612612411, 178.58322923140534, 2.3022243132830176], "isController": false}, {"data": ["2.2 Session register", 786, 0, 0.0, 644.103053435114, 345, 2095, 556.5, 1037.0, 1235.65, 1698.73, 0.44312871423328304, 184.65003133719165, 1.8332199847949346], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 183, 0, 0.0, 5724.333333333337, 2101, 12329, 5494.0, 6905.8, 7907.399999999998, 11015.239999999994, 0.1085650723025584, 129.27231704208378, 1.8105922089358546], "isController": true}, {"data": ["2.1 Open session", 789, 0, 0.0, 1197.9771863117883, 519, 3864, 1076.0, 1904.0, 2207.5, 2963.5000000000023, 0.44298641339896344, 178.16382019794165, 1.8287456161048299], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.1934651762682717], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9304, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 758, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
