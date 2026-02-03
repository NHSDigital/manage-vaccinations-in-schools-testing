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

    var data = {"OkPercent": 99.70459580753281, "KoPercent": 0.29540419246719307};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30768013741976313, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.001026694045174538, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.01853099730458221, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7422030524220306, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7136752136752137, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.35369039843239714, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.12436548223350254, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3045186640471513, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4489174560216509, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4516655780535598, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.323202614379085, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6376478318002629, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.40923984272608127, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 17603, 52, 0.29540419246719307, 1375.5974549792613, 308, 20329, 1043.0, 2346.0, 3128.9999999999964, 6528.599999999969, 4.888491951747699, 1965.7927551449031, 20.30189427067105], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1461, 0, 0.0, 2958.1964407939795, 1433, 19561, 2392.0, 4395.4, 5842.299999999995, 11619.339999999976, 0.4240169467471283, 168.08273765808852, 2.1994425159376387], "isController": false}, {"data": ["4.1 Vaccination questions", 1484, 0, 0.0, 1898.9656334231831, 721, 16399, 1645.0, 2402.0, 3045.75, 6069.200000000039, 0.42306189047657466, 164.35814242511105, 2.1099296406596686], "isController": false}, {"data": ["2.0 Register attendance", 1512, 52, 3.439153439153439, 4803.2334656084695, 1647, 22202, 4327.0, 7515.500000000001, 9430.699999999997, 15128.209999999992, 0.42472148719936625, 792.8914291324144, 7.311910427253102], "isController": true}, {"data": ["1.0 Login", 1529, 0, 0.0, 5246.209287115766, 2263, 23424, 4761.0, 6733.0, 8665.0, 13152.600000000002, 0.4257889417961276, 698.2089034305667, 7.053431438721062], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 368, 0, 0.0, 6089.116847826085, 2400, 22749, 5232.5, 8146.800000000006, 12011.700000000004, 19909.17, 0.1057151688627461, 124.39821504345166, 1.5440313777631014], "isController": true}, {"data": ["2.5 Select patient", 1507, 0, 0.0, 658.0258792302587, 352, 6789, 474.0, 1096.8000000000002, 1585.1999999999994, 3584.1600000000017, 0.42529521612024085, 170.34132228563513, 1.511684105028728], "isController": false}, {"data": ["2.3 Search by first/last name", 1521, 0, 0.0, 665.0729783037474, 359, 8385, 518.0, 930.1999999999998, 1290.8999999999999, 4054.6399999999826, 0.42643504785829234, 170.85541490022163, 1.5855857515392033], "isController": false}, {"data": ["4.0 Vaccination for flu", 372, 0, 0.0, 6006.0349462365575, 2434, 22297, 5276.0, 8065.299999999998, 10725.349999999973, 17222.459999999995, 0.10639505800675723, 124.18242762633484, 1.5492009529150388], "isController": true}, {"data": ["4.0 Vaccination for hpv", 370, 0, 0.0, 6003.021621621622, 2459, 22071, 5192.5, 8865.900000000001, 11022.749999999995, 16924.80000000003, 0.10631224653867438, 124.03397949509728, 1.5504387454336017], "isController": true}, {"data": ["1.2 Sign-in page", 1531, 0, 0.0, 1230.606139777926, 308, 18292, 912.0, 1976.0, 2323.9999999999986, 5225.280000000017, 0.42597922356591633, 168.60201472687177, 1.8192962301882099], "isController": false}, {"data": ["2.4 Patient attending session", 985, 52, 5.279187817258883, 2296.7380710659913, 398, 15337, 1808.0, 3860.999999999999, 5695.09999999998, 9444.439999999997, 0.2769369702701836, 111.37061691233342, 1.202471889579607], "isController": false}, {"data": ["1.4 Open Sessions list", 1527, 0, 0.0, 1596.4099541584799, 771, 17269, 1335.0, 2305.6000000000004, 2732.9999999999973, 5057.08, 0.426192739595957, 193.0079081587441, 1.5143869987944076], "isController": false}, {"data": ["4.2 Vaccination batch", 1478, 0, 0.0, 1186.9600811907972, 524, 18309, 989.0, 1528.3000000000004, 2063.5999999999995, 6172.210000000007, 0.4224513152012732, 164.870970938465, 1.8913318038528244], "isController": false}, {"data": ["1.1 Homepage", 1531, 0, 0.0, 1031.952318745921, 508, 11136, 848.0, 1490.3999999999999, 2009.7999999999963, 5144.760000000018, 0.4258768445390961, 168.5273843909356, 1.8107018934064472], "isController": false}, {"data": ["1.3 Sign-in", 1530, 0, 0.0, 1388.9313725490176, 509, 20329, 1141.0, 2041.7000000000003, 2395.1500000000005, 5813.970000000007, 0.4260600611020252, 168.73331694432161, 1.9149019148997937], "isController": false}, {"data": ["2.2 Session register", 1522, 0, 0.0, 722.6103810775278, 357, 8274, 567.0, 1033.1000000000001, 1440.699999999998, 4240.269999999999, 0.4257593944705547, 174.6879009414961, 1.5201459923578706], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 368, 0, 0.0, 5945.858695652178, 2406, 28559, 5253.5, 8115.200000000001, 10184.550000000003, 17004.420000000006, 0.10700501964036427, 125.38915482817626, 1.5641201024304097], "isController": true}, {"data": ["2.1 Open session", 1526, 0, 0.0, 1263.5937090432512, 483, 14691, 1038.0, 1929.1999999999998, 2527.949999999997, 5703.930000000004, 0.4261314054098582, 168.46480586072053, 1.5177342553381616], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, 100.0, 0.29540419246719307], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 17603, 52, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 985, 52, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 52, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
