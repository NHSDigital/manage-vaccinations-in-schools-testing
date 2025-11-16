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

    var data = {"OkPercent": 99.92072744229424, "KoPercent": 0.07927255770575892};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5114343526896499, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.28566796368352787, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4468969929622521, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [3.1426775612822125E-4, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8443813131313131, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8764115432873275, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.5034267912772585, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.43226600985221675, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.3899312070043777, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4903660886319846, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49223119950279676, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.47345409119300436, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7936010037641155, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6090225563909775, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21445, 17, 0.07927255770575892, 765.871391932847, 0, 11325, 664.0, 1413.9000000000015, 1633.0, 2448.970000000005, 5.954658517202563, 148.73121265929996, 21.343747290536662], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1542, 0, 0.0, 1632.8391699092076, 1112, 11325, 1453.0, 2149.4, 2509.85, 4489.169999999995, 0.44403963183297657, 11.725974957834952, 2.303331293412289], "isController": false}, {"data": ["4.1 Vaccination questions", 1563, 0, 0.0, 1338.0383877159304, 628, 9693, 1261.0, 1513.0, 1765.3999999999996, 2632.559999999993, 0.44344312735499364, 7.814118326702256, 2.2043050413851883], "isController": false}, {"data": ["Get Next Patient from STS", 1598, 0, 0.0, 0.6145181476846044, 0, 9, 1.0, 1.0, 1.0, 1.0, 0.44598825471232084, 0.1879190820875153, 0.2847349504431136], "isController": false}, {"data": ["2.0 Register attendance", 1591, 17, 1.0685103708359522, 2864.7423004399748, 1490, 11933, 2805.0, 3863.3999999999996, 4383.399999999998, 6652.199999999999, 0.4457606509058103, 54.1061583232178, 7.6814691045107], "isController": true}, {"data": ["1.0 Login", 1600, 0, 0.0, 3778.5193749999958, 2500, 12761, 3655.5, 4414.9, 4719.799999999999, 6192.910000000001, 0.44566718187649834, 69.09475223542132, 7.408673143388819], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 391, 0, 0.0, 3717.5447570332517, 1988, 13075, 3475.0, 4449.6, 5063.599999999996, 9778.319999999974, 0.11232317359216117, 6.901926074007757, 1.6390979273142667], "isController": true}, {"data": ["2.5 Select patient", 1584, 0, 0.0, 519.9766414141408, 388, 6772, 459.0, 649.5, 805.0, 1476.7500000000023, 0.44508359647777024, 10.965326395866736, 1.5820299218968203], "isController": false}, {"data": ["2.3 Search by first/last name", 1594, 0, 0.0, 489.2678795483063, 381, 6486, 439.0, 600.0, 719.5, 1261.599999999995, 0.4468097392189631, 11.038045494968625, 1.6521130746613748], "isController": false}, {"data": ["4.0 Vaccination for flu", 393, 0, 0.0, 3688.9185750636157, 2055, 12703, 3474.0, 4396.6, 4842.5999999999985, 7339.580000000002, 0.11173085884071132, 6.578875898271328, 1.626959581219663], "isController": true}, {"data": ["4.0 Vaccination for hpv", 381, 0, 0.0, 3734.6272965879275, 1944, 12832, 3447.0, 4520.400000000001, 5251.6, 7972.980000000007, 0.10961088997138034, 6.254177218243194, 1.5969575974515613], "isController": true}, {"data": ["1.2 Sign-in page", 1605, 0, 0.0, 836.1115264797506, 295, 7796, 663.0, 1368.0, 1444.3999999999996, 1971.94, 0.4463503558288351, 9.115656082010274, 1.9070565549191703], "isController": false}, {"data": ["Debug Sampler", 1591, 0, 0.0, 0.5122564424889996, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.445968817501487, 2.8121268081393653, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 812, 17, 2.0935960591133007, 1191.0357142857133, 594, 8404, 1024.0, 1585.5000000000011, 2117.7999999999993, 3844.750000000001, 0.2288822316355834, 6.1995407455648435, 0.9990425554292444], "isController": false}, {"data": ["1.4 Open Sessions list", 1599, 0, 0.0, 1184.784240150097, 602, 6868, 1068.0, 1649.0, 1810.0, 2485.0, 0.44588282009869096, 34.74723542717471, 1.5843992291058309], "isController": false}, {"data": ["4.2 Vaccination batch", 1557, 0, 0.0, 764.0051380860621, 591, 7008, 679.0, 946.0, 1220.0, 1980.4000000000015, 0.44279725004991066, 7.292805731575994, 1.982476459243741], "isController": false}, {"data": ["1.1 Homepage", 1609, 0, 0.0, 787.8558110627724, 593, 3872, 694.0, 1105.0, 1348.5, 1682.800000000003, 0.44688287391514947, 16.020402336580847, 1.9010567072738034], "isController": false}, {"data": ["1.3 Sign-in", 1601, 0, 0.0, 971.9063085571523, 537, 9035, 865.0, 1397.8, 1519.4999999999993, 2150.1600000000008, 0.44575290198781853, 9.268693921114405, 2.0265535178597682], "isController": false}, {"data": ["2.2 Session register", 1594, 0, 0.0, 550.9052697616067, 373, 6747, 451.5, 788.0, 961.75, 1856.4999999999968, 0.44674324454988656, 15.098170882093696, 1.5951635235472086], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 392, 0, 0.0, 3731.5586734693898, 1875, 13218, 3468.0, 4417.2, 5299.099999999996, 8534.819999999994, 0.11325649996966343, 7.2016767564327955, 1.6554988315006196], "isController": true}, {"data": ["2.1 Open session", 1596, 0, 0.0, 698.406015037595, 408, 5224, 616.5, 1061.6, 1250.0, 1871.1799999999998, 0.44564051330192256, 7.929925428859188, 1.5873118331098615], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, 100.0, 0.07927255770575892], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21445, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 812, 17, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
