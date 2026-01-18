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

    var data = {"OkPercent": 99.93436474449133, "KoPercent": 0.06563525550867323};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5514499711926253, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.39568345323741005, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4809061488673139, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9302176696542894, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8903061224489796, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6835839598997494, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.48059866962305986, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.4924575738529227, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.5, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.5347309136420526, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6107277289836889, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.8130573248407643, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5200254291163382, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21330, 14, 0.06563525550867323, 668.164697609001, 0, 2670, 620.0, 1266.0, 1386.0, 1733.9600000000064, 5.9240027928632015, 2000.2757584309245, 21.26278659541963], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1529, 0, 0.0, 1365.2799215173318, 970, 2670, 1310.0, 1709.0, 1890.5, 2306.9000000000005, 0.4404719070244178, 172.3683320468231, 2.284789349495877], "isController": false}, {"data": ["4.1 Vaccination questions", 1545, 0, 0.0, 1212.6511326860814, 503, 2395, 1186.0, 1338.4, 1451.5999999999985, 1827.0199999999995, 0.4398408715510924, 168.3024046978528, 2.1865830643400366], "isController": false}, {"data": ["Get Next Patient from STS", 1591, 0, 0.0, 0.6543054682589562, 0, 10, 1.0, 1.0, 1.0, 1.0, 0.44424985438321873, 0.18658077225339945, 0.2836306310623631], "isController": false}, {"data": ["2.0 Register attendance", 1566, 14, 0.8939974457215837, 2663.2911877394627, 1514, 4890, 2688.0, 3364.6, 3624.0, 4053.189999999997, 0.43879226212541894, 794.2231343106758, 7.690420623432459], "isController": true}, {"data": ["1.0 Login", 1594, 0, 0.0, 3076.7710163111633, 1738, 4822, 3092.0, 3526.5, 3742.0, 4082.25, 0.44388007997638584, 717.0957250544582, 7.376898399253981], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 392, 0, 0.0, 3353.1913265306125, 1799, 4599, 3289.0, 3848.7, 3938.35, 4276.549999999999, 0.11245141209713277, 130.129371174375, 1.6424873868672816], "isController": true}, {"data": ["2.5 Select patient", 1562, 0, 0.0, 407.60179257362364, 300, 1600, 369.5, 532.0, 616.5499999999997, 861.2199999999993, 0.4390224022282776, 173.0513500703012, 1.5604963191119492], "isController": false}, {"data": ["2.3 Search by first/last name", 1568, 0, 0.0, 427.02678571428595, 300, 1165, 410.0, 558.3000000000004, 623.0, 824.2699999999991, 0.4392070743710908, 173.22992873520337, 1.624105934897635], "isController": false}, {"data": ["4.0 Vaccination for flu", 366, 0, 0.0, 3355.5601092896204, 2785, 4628, 3288.0, 3733.4, 4009.95, 4358.089999999999, 0.11037334537991049, 127.88908380661685, 1.6129721042678296], "isController": true}, {"data": ["4.0 Vaccination for hpv", 394, 0, 0.0, 3324.865482233502, 1785, 5128, 3268.5, 3705.0, 3973.75, 4399.0, 0.1125878985725912, 129.3276936266284, 1.636160105778331], "isController": true}, {"data": ["1.2 Sign-in page", 1596, 0, 0.0, 649.4235588972433, 204, 2184, 542.0, 1191.0, 1243.4499999999996, 1428.2099999999998, 0.44448714788805943, 173.26233719022017, 1.899013996488802], "isController": false}, {"data": ["Debug Sampler", 1566, 0, 0.0, 0.45146871008940026, 0, 7, 0.0, 1.0, 1.0, 1.0, 0.4386961368126849, 2.803190958934148, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 902, 14, 1.5521064301552105, 923.3370288248346, 355, 2590, 864.0, 1173.1000000000001, 1360.499999999999, 1630.97, 0.25626820086653884, 101.22462921283471, 1.1195735892108813], "isController": false}, {"data": ["1.4 Open Sessions list", 1591, 0, 0.0, 950.6932746700185, 458, 2090, 811.0, 1421.0, 1504.1999999999996, 1786.2399999999998, 0.4441626668297031, 198.4535277994078, 1.5782817790745782], "isController": false}, {"data": ["4.2 Vaccination batch", 1545, 0, 0.0, 779.0478964401292, 490, 1872, 775.0, 933.4000000000001, 1072.499999999999, 1283.0, 0.43968202878679347, 169.39328942507095, 1.9685211523518151], "isController": false}, {"data": ["1.1 Homepage", 1598, 0, 0.0, 665.9906132665841, 468, 1683, 632.5, 864.1000000000001, 909.0, 1175.05, 0.44383328644105974, 172.86432050457012, 1.8879511444364887], "isController": false}, {"data": ["1.3 Sign-in", 1594, 0, 0.0, 812.250941028858, 404, 1953, 708.0, 1245.0, 1288.25, 1521.149999999999, 0.44405703207768826, 173.30631168421235, 2.0188963447719805], "isController": false}, {"data": ["2.2 Session register", 1570, 0, 0.0, 475.93885350318493, 296, 1383, 445.0, 622.9000000000001, 693.4499999999998, 870.6099999999997, 0.4387781509721032, 176.05468667030405, 1.5664176386685682], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 393, 0, 0.0, 3338.6895674300276, 1833, 4591, 3275.0, 3791.8, 3986.7, 4327.06, 0.1137390392321544, 131.52830719002569, 1.6580428618008451], "isController": true}, {"data": ["2.1 Open session", 1573, 0, 0.0, 820.8372536554359, 336, 2126, 754.0, 1248.6000000000001, 1386.3, 1646.86, 0.43919262268076703, 170.01409947398795, 1.5640415825962732], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, 100.0, 0.06563525550867323], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21330, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 902, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
